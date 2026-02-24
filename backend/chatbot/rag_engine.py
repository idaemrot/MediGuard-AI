import os
import json
import traceback
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from groq import Groq


DB_FAISS_PATH = Path(__file__).parent / "vectorstores" / "db_faiss"


class MedicalRAG:
    def __init__(self):
        self.is_initialized = False
        self.vector_store = None
        self.embeddings = None
        self.groq_client = None
        self.model = "llama-3.1-8b-instant"

    # ==========================================
    # INITIALIZATION
    # ==========================================
    def initialize(self):
        print("\n" + "=" * 60)
        print("INITIALIZING MEDICAL RAG (AI Guardrail Mode)")
        print("=" * 60)

        try:
            # Load embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )

            # Load FAISS
            if DB_FAISS_PATH.exists():
                self.vector_store = FAISS.load_local(
                    str(DB_FAISS_PATH),
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                print("[+] FAISS loaded successfully.")
            else:
                print("[!] FAISS index not found.")
                self.vector_store = None

            # Initialize Groq
            groq_key = os.getenv("GROQ_API_KEY")
            if groq_key:
                self.groq_client = Groq(api_key=groq_key)
                print("[+] Groq connected.")
            else:
                print("[!] GROQ_API_KEY not found.")

            self.is_initialized = True
            print("=" * 60 + "\n")

        except Exception as e:
            print("CRITICAL ERROR:", str(e))
            traceback.print_exc()
            self.is_initialized = False

    # ==========================================
    # AI-BASED MEDICAL CLASSIFIER
    # ==========================================
    def is_medical_query(self, query: str) -> bool:
        if not self.groq_client:
            return False  # Fail closed if LLM unavailable

        classification_prompt = f"""
You are a strict binary classifier.

A question is MEDICAL only if it clearly relates to:
- diseases
- symptoms
- diagnosis
- treatment
- medication
- health conditions
- mental health
- injury
- medical procedures

Everything else is NON_MEDICAL.

Respond with EXACTLY one word:
MEDICAL
or
NON_MEDICAL

Question:
{query}
"""

        try:
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": classification_prompt}],
                temperature=0,
                max_tokens=3,
            )

            decision = response.choices[0].message.content.strip().upper()
            return decision == "MEDICAL"

        except Exception:
            return False  # Fail safe

    # ==========================================
    # MAIN RESPONSE FUNCTION
    # ==========================================
    def get_response(self, query: str):
        if not self.is_initialized:
            return {
                "summary": "The medical assistant is still initializing.",
                "what_to_try": [],
                "seek_care_if": []
            }

        try:
            # Step 1: Intent classification
            if not self.is_medical_query(query):
                return {
                    "summary": "I'm a medical assistant and can only answer health-related questions.",
                    "what_to_try": [],
                    "seek_care_if": []
                }

            # Step 2: Retrieve documents if FAISS available
            strong_matches = []

            if self.vector_store:
                results = self.vector_store.similarity_search_with_score(query, k=5)
                strong_matches = [
                    doc for doc, score in results if score < 0.65
                ]

            # JSON enforcement instruction
            json_format_instruction = """
Return your response in STRICT JSON format ONLY.
Do not include markdown, backticks, or any text outside JSON.

Structure:
{
  "summary": "A concise medical explanation (max 60 words).",
  "what_to_try": ["Actionable step 1", "Actionable step 2"],
  "seek_care_if": ["Warning sign 1", "Warning sign 2"]
}
"""

            # Build prompt
            if strong_matches:
                context = "\n\n".join([doc.page_content for doc in strong_matches])

                prompt = f"""
You are a professional medical assistant.
Use ONLY the provided medical literature.
If the answer is unclear, give safe general medical guidance.

{json_format_instruction}

Medical Literature:
{context}

User Question:
{query}
"""
            else:
                prompt = f"""
You are a medical assistant providing general safe health guidance.

{json_format_instruction}

User Question:
{query}
"""

            # Step 3: Call LLM
            if self.groq_client:
                completion = self.groq_client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=400,
                )

                raw_response = completion.choices[0].message.content.strip()

                # Clean accidental markdown
                if raw_response.startswith("```json"):
                    raw_response = raw_response.replace("```json", "", 1).replace("```", "", 1).strip()
                elif raw_response.startswith("```"):
                    raw_response = raw_response.replace("```", "", 2).strip()

                try:
                    return json.loads(raw_response)
                except json.JSONDecodeError:
                    return {
                        "summary": raw_response,
                        "what_to_try": [],
                        "seek_care_if": []
                    }

            return {
                "summary": "LLM service is currently unavailable.",
                "what_to_try": [],
                "seek_care_if": []
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "summary": f"An internal error occurred: {str(e)}",
                "what_to_try": [],
                "seek_care_if": []
            }