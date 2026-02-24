# import os
# import json
# import traceback
# from pathlib import Path

# from dotenv import load_dotenv
# load_dotenv()

# from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain_community.vectorstores import FAISS
# from groq import Groq


# # ==============================
# # Path to FAISS DB
# # ==============================
# DB_FAISS_PATH = Path(__file__).parent / "vectorstores" / "db_faiss"


# class MedicalRAG:
#     def __init__(self):
#         self.is_initialized = False
#         self.vector_store = None
#         self.embeddings = None
#         self.groq_client = None
#         self.model = "llama-3.1-8b-instant"

#     def initialize(self):
#         print("\n" + "=" * 60)
#         print("INITIALIZING MEDICAL RAG (Structured JSON Mode)")
#         print("=" * 60)

#         try:
#             # 1️⃣ Load Embeddings
#             self.embeddings = HuggingFaceEmbeddings(
#                 model_name="sentence-transformers/all-MiniLM-L6-v2"
#             )

#             # 2️⃣ Load FAISS
#             if DB_FAISS_PATH.exists():
#                 self.vector_store = FAISS.load_local(
#                     str(DB_FAISS_PATH),
#                     self.embeddings,
#                     allow_dangerous_deserialization=True,
#                 )
#                 print("[+] FAISS loaded successfully.")
#             else:
#                 print("[!] FAISS index not found.")
#                 self.is_initialized = True
#                 return

#             # 3️⃣ Initialize Groq
#             groq_key = os.getenv("GROQ_API_KEY")
#             if groq_key:
#                 self.groq_client = Groq(api_key=groq_key)
#                 print("[+] Groq connected.")
#             else:
#                 print("[!] GROQ_API_KEY not found.")

#             self.is_initialized = True
#             print("=" * 60 + "\n")

#         except Exception as e:
#             print("CRITICAL ERROR:", str(e))
#             traceback.print_exc()
#             self.is_initialized = False

#     def get_response(self, query: str):
#         if not self.is_initialized:
#             return {
#                 "summary": "The medical assistant is still initializing. Please try again in a moment.",
#                 "what_to_try": [],
#                 "seek_care_if": []
#             }

#         try:
#             # Retrieve with similarity score
#             results = self.vector_store.similarity_search_with_score(query, k=5)
#             # Lower score = better match
#             strong_matches = [doc for doc, score in results if score < 0.65]

#             json_format_instruction = """
# Return your response in STRICT JSON format ONLY. Do not include markdown, backticks, or any text outside the JSON object.
# Structure:
# {
#   "summary": "A concise medical explanation (max 60 words).",
#   "what_to_try": ["Actionable step 1", "Actionable step 2"],
#   "seek_care_if": ["Warning sign 1", "Warning sign 2"]
# }
# """

#             if strong_matches:
#                 context = "\n\n".join([doc.page_content for doc in strong_matches])
#                 prompt = f"""
# You are a professional medical assistant. Use ONLY the provided medical literature.
# {json_format_instruction}

# Medical Literature:
# {context}

# User Question:
# {query}
# """
#             else:
#                 prompt = f"""
# You are a medical assistant providing general health guidance.
# {json_format_instruction}

# User Question:
# {query}
# """

#             if self.groq_client:
#                 completion = self.groq_client.chat.completions.create(
#                     model=self.model,
#                     messages=[{"role": "user", "content": prompt}],
#                     temperature=0.2,
#                     max_tokens=400,
#                 )
#                 raw_response = completion.choices[0].message.content.strip()
                
#                 # Clean potential markdown wrappers if LLM ignores instructions
#                 if raw_response.startswith("```json"):
#                     raw_response = raw_response.replace("```json", "", 1).replace("```", "", 1).strip()
#                 elif raw_response.startswith("```"):
#                     raw_response = raw_response.replace("```", "", 2).strip()

#                 try:
#                     return json.loads(raw_response)
#                 except json.JSONDecodeError:
#                     return {
#                         "summary": raw_response,
#                         "what_to_try": [],
#                         "seek_care_if": []
#                     }

#             return {
#                 "summary": "LLM service is currently unavailable.",
#                 "what_to_try": [],
#                 "seek_care_if": []
#             }

#         except Exception as e:
#             traceback.print_exc()
#             return {
#                 "summary": f"An internal error occurred: {str(e)}",
#                 "what_to_try": [],
#                 "seek_care_if": []
#             }


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

    def initialize(self):
        print("\n" + "=" * 60)
        print("INITIALIZING MEDICAL RAG (AI Guardrail Mode)")
        print("=" * 60)

        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )

            if DB_FAISS_PATH.exists():
                self.vector_store = FAISS.load_local(
                    str(DB_FAISS_PATH),
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                print("[+] FAISS loaded successfully.")
            else:
                print("[!] FAISS index not found.")
                self.is_initialized = True
                return

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
#     def is_medical_query(self, query: str) -> bool:
#         if not self.groq_client:
#             return True  # fallback if LLM unavailable

#         classification_prompt = f"""
# You are a strict classifier.

# Determine if the following user question is medical or health-related.

# Respond ONLY with:
# MEDICAL
# or
# NON_MEDICAL

# Question:
# {query}
# """

#         try:
#             response = self.groq_client.chat.completions.create(
#                 model=self.model,
#                 messages=[{"role": "user", "content": classification_prompt}],
#                 temperature=0,
#                 max_tokens=5,
#             )

#             decision = response.choices[0].message.content.strip().upper()
#             return decision == "MEDICAL"

#         except Exception:
#             return True  # fail open instead of blocking everything

def is_medical_query(self, query: str) -> bool:
    if not self.groq_client:
        return True  # fallback if LLM unavailable

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

        # STRICT decision rule
        if decision == "MEDICAL":
            return True
        else:
            return False  # default reject

    except Exception:
        return False  # fail safe (block if unsure)

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
            # 🔒 Step 1: AI Intent Classification
            if not self.is_medical_query(query):
                return {
                    "summary": "I'm a medical assistant and can only answer health-related questions.",
                    "what_to_try": [],
                    "seek_care_if": []
                }

            # 🔍 Step 2: Retrieve Documents
            results = self.vector_store.similarity_search_with_score(query, k=5)
            strong_matches = [doc for doc, score in results if score < 0.65]

            json_format_instruction = """
Return your response in STRICT JSON format ONLY. Do not include markdown, backticks, or text outside JSON.

Structure:
{
  "summary": "A concise medical explanation (max 60 words).",
  "what_to_try": ["Actionable step 1", "Actionable step 2"],
  "seek_care_if": ["Warning sign 1", "Warning sign 2"]
}
"""

            if strong_matches:
                context = "\n\n".join([doc.page_content for doc in strong_matches])

                prompt = f"""
You are a professional medical assistant.

Use ONLY the provided medical literature.
If the answer is not clearly found, provide general safe medical guidance.

{json_format_instruction}

Medical Literature:
{context}

User Question:
{query}
"""
            else:
                prompt = f"""
You are a medical assistant providing general health guidance.

{json_format_instruction}

User Question:
{query}
"""

            if self.groq_client:
                completion = self.groq_client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=400,
                )

                raw_response = completion.choices[0].message.content.strip()

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