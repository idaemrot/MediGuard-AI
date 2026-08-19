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

# FAISS (IndexFlatL2) returns *squared* L2 distance, not plain Euclidean distance.
# all-MiniLM-L6-v2 embeddings are unit-normalized (verified against the built index:
# every stored vector has norm ~1.0), so for unit vectors squared_L2 = 2 - 2*cos_sim.
#
# Empirically tested against the real index with representative on-topic questions:
# conversational phrasing of clearly-covered topics (diabetes, hypertension, fever,
# heart attack) scored 0.68-0.98 squared-L2 distance to their best matching chunk,
# while off-topic questions (capital of France, cat joke) scored 1.26+. A threshold
# of 0.65 left nearly all realistic on-topic questions ungrounded; 1.0 covers the
# on-topic cluster with a clear margin below the off-topic one.
EVIDENCE_DISTANCE_THRESHOLD = 1.0


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
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                encode_kwargs={"normalize_embeddings": True}
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
                max_tokens=5,
            )

            decision = response.choices[0].message.content.strip().upper()
            # Check for the NON_MEDICAL prefix rather than exact-matching "MEDICAL":
            # a truncated/punctuated reply like "MEDICAL." still correctly classifies as medical.
            return not decision.startswith("NON")

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
                "seek_care_if": [],
                "sources": [],
                "grounded": False
            }

        try:
            # Step 1: Intent classification
            if not self.is_medical_query(query):
                return {
                    "summary": "I'm a medical assistant and can only answer health-related questions.",
                    "what_to_try": [],
                    "seek_care_if": [],
                    "sources": [],
                    "grounded": False
                }

            # Step 2: Retrieve documents if FAISS available.
            # Two separate notions of "relevant" here, deliberately decoupled:
            #  - context_matches: the top 3 nearest chunks regardless of distance, given
            #    to the LLM as *candidate* context. The prompt instructs it to ignore
            #    anything that doesn't actually support the answer, so a borderline or
            #    irrelevant chunk can't hurt — it just doesn't get used.
            #  - strong_matches: only chunks that clear EVIDENCE_DISTANCE_THRESHOLD. This
            #    is the precision-favoring bar used for `sources` and `grounded`, since
            #    those are shown to the user as cited evidence and a weak match displayed
            #    as "evidence" would undermine trust rather than support it.
            context_matches = []
            strong_matches = []

            if self.vector_store:
                results = self.vector_store.similarity_search_with_score(query, k=5)
                context_matches = [doc for doc, score in results[:3]]
                strong_matches = [
                    doc for doc, score in results if score < EVIDENCE_DISTANCE_THRESHOLD
                ]

            # Real retrieved excerpts, deduped, for UI display alongside the answer.
            # This is also the sole basis for `grounded` below — a passage only counts
            # as evidence if it cleared the same bar shown to the user.
            sources = []
            for doc in strong_matches:
                excerpt = doc.page_content.strip().replace("\n", " ")
                excerpt = (excerpt[:200] + "…") if len(excerpt) > 200 else excerpt
                if excerpt and excerpt not in sources:
                    sources.append(excerpt)

            grounded = len(sources) > 0

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
            if context_matches:
                context = "\n\n".join([doc.page_content for doc in context_matches])

                prompt = f"""
You are a professional medical assistant.

Below is retrieved context from a medical encyclopedia. It was matched by semantic
similarity and may NOT be relevant to the question — do not assume it applies.
Use it only if it directly supports the answer. If it doesn't help, ignore it
completely and give safe general medical guidance instead. Never mention the
retrieval process itself or say things like "the provided context does not contain...".

{json_format_instruction}

Retrieved Context:
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
                    parsed = json.loads(raw_response)
                    if not isinstance(parsed, dict):
                        raise ValueError("LLM response was not a JSON object")
                    # Coerce shape defensively: the LLM's own JSON is not schema-validated
                    # upstream, so a dropped/mistyped key here must not crash the frontend.
                    summary = parsed.get("summary")
                    what_to_try = parsed.get("what_to_try")
                    seek_care_if = parsed.get("seek_care_if")
                    return {
                        "summary": summary if isinstance(summary, str) and summary else raw_response,
                        "what_to_try": what_to_try if isinstance(what_to_try, list) else [],
                        "seek_care_if": seek_care_if if isinstance(seek_care_if, list) else [],
                        "sources": sources,
                        "grounded": grounded
                    }
                except (json.JSONDecodeError, ValueError):
                    return {
                        "summary": raw_response,
                        "what_to_try": [],
                        "seek_care_if": [],
                        "sources": sources,
                        "grounded": grounded
                    }

            return {
                "summary": "LLM service is currently unavailable.",
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "summary": f"An internal error occurred: {str(e)}",
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False
            }