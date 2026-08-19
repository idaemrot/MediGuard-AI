import os
import re
import json
import traceback
from pathlib import Path
from typing import Optional

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

# ==========================================
# LOCAL GREETING / SMALL-TALK HANDLER
# ==========================================
# Deliberately a small, exact-match whitelist — NOT substring/fuzzy matching, and
# NOT an LLM call. This must never grow into general conversation handling, and it
# must never risk swallowing real medical text (e.g. "I have a fever" is nowhere
# close to any entry below, even after normalization).

_GREETING_REPLY = "Hello! I'm MediGuard. How can I help you with a health-related question today?"
_HOW_ARE_YOU_REPLY = (
    "I'm doing well, thank you. I'm here to help with health-related questions. "
    "What would you like to know?"
)
_THANKS_REPLY = "You're welcome. Let me know if you have another health-related question."
_BYE_REPLY = "Goodbye. Feel free to come back anytime you have a health-related question."

_SMALL_TALK_PHRASES = {
    "hi": _GREETING_REPLY,
    "hello": _GREETING_REPLY,
    "hey": _GREETING_REPLY,
    "yo": _GREETING_REPLY,
    "greetings": _GREETING_REPLY,
    "good morning": _GREETING_REPLY,
    "good afternoon": _GREETING_REPLY,
    "good evening": _GREETING_REPLY,
    "how are you": _HOW_ARE_YOU_REPLY,
    "how are you doing": _HOW_ARE_YOU_REPLY,
    "hows it going": _HOW_ARE_YOU_REPLY,
    "thanks": _THANKS_REPLY,
    "thank you": _THANKS_REPLY,
    "thanks a lot": _THANKS_REPLY,
    "thank you so much": _THANKS_REPLY,
    "bye": _BYE_REPLY,
    "goodbye": _BYE_REPLY,
    "bye bye": _BYE_REPLY,
    "see you": _BYE_REPLY,
}

_NON_LETTER_RE = re.compile(r"[^a-z\s]")
_REPEATED_CHAR_RE = re.compile(r"(.)\1+")
_WHITESPACE_RE = re.compile(r"\s+")


def _normalize_small_talk(text: str) -> str:
    """
    Lowercase, drop punctuation, and collapse repeated letters so casual variants
    ("Hiii!!", "heyyy", "THANKS.") match the same canonical form as the whitelist
    entries (which are normalized with this same function, so e.g. "hello"'s
    double-l collapses on both sides consistently).
    """
    lowered = text.strip().lower()
    letters_only = _NON_LETTER_RE.sub(" ", lowered)
    collapsed = _REPEATED_CHAR_RE.sub(r"\1", letters_only)
    return _WHITESPACE_RE.sub(" ", collapsed).strip()


_SMALL_TALK_LOOKUP = {
    _normalize_small_talk(phrase): reply for phrase, reply in _SMALL_TALK_PHRASES.items()
}


def detect_small_talk(query: str) -> Optional[str]:
    """
    Returns a canned reply if the *entire* message is a greeting or basic
    conversational filler, or None otherwise. Exact-match only (post-normalization)
    so real medical text can never be misclassified as small talk just because it
    contains a short word somewhere in it.
    """
    return _SMALL_TALK_LOOKUP.get(_normalize_small_talk(query))


class MedicalRAG:
    def __init__(self):
        self.is_initialized = False
        self.vector_store = None
        self.embeddings = None
        self.groq_client = None
        # "llama-3.1-8b-instant" was retired from Groq's catalog (confirmed via a live
        # 404 from the API and this account's /models list, which no longer includes
        # it) — every Groq call in this class was silently failing into fail-safe
        # fallbacks. Verified live against this account: gpt-oss-20b classifies and
        # generates correctly. It's a reasoning model, so calls need a real max_tokens
        # budget (reasoning tokens count against it even though hidden from `content`)
        # and reasoning_effort="low" to keep latency reasonable for a single-word or
        # short-JSON task.
        self.model = "openai/gpt-oss-20b"

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

        classification_prompt = f"""You are a strict binary classifier. Classify the input as MEDICAL only if it clearly relates to: diseases, symptoms, diagnosis, treatment, medication, health conditions, mental health, injury, or medical procedures. Everything else is NON_MEDICAL.

Respond with exactly one word: MEDICAL or NON_MEDICAL.

Question:
{query}
"""

        try:
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": classification_prompt}],
                temperature=0,
                max_tokens=150,
                reasoning_effort="low",
            )

            decision = (response.choices[0].message.content or "").strip().upper()
            # Check for the NON_MEDICAL prefix rather than exact-matching "MEDICAL":
            # a truncated/punctuated reply like "MEDICAL." still correctly classifies as medical.
            return not decision.startswith("NON")

        except Exception:
            return False  # Fail safe

    # ==========================================
    # MAIN RESPONSE FUNCTION
    # ==========================================
    def get_response(self, query: str):
        # Step 0: local greeting/small-talk handler — before initialization checks,
        # before the classifier, before Groq/FAISS. No external calls at all.
        small_talk_reply = detect_small_talk(query)
        if small_talk_reply is not None:
            return {
                "summary": small_talk_reply,
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False,
                "conversational": True
            }

        if not self.is_initialized:
            return {
                "summary": "The medical assistant is still initializing.",
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False,
                "conversational": False
            }

        try:
            # Step 1: Intent classification
            if not self.is_medical_query(query):
                return {
                    "summary": "I'm a medical assistant and can only answer health-related questions.",
                    "what_to_try": [],
                    "seek_care_if": [],
                    "sources": [],
                    "grounded": False,
                    "conversational": False
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
            json_format_instruction = """Return STRICT JSON only — no markdown, backticks, or extra text.
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

                prompt = f"""You are a professional medical assistant. The context below may not be relevant to the question — use it only if it directly supports the answer; otherwise ignore it completely and give safe general medical guidance instead. Never mention the retrieval process itself or say the context doesn't contain the answer.

{json_format_instruction}

Retrieved Context:
{context}

User Question:
{query}
"""
            else:
                prompt = f"""You are a medical assistant providing general safe health guidance.

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
                    max_tokens=250,
                    reasoning_effort="low",
                )

                raw_response = (completion.choices[0].message.content or "").strip()

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
                        "grounded": grounded,
                        "conversational": False
                    }
                except (json.JSONDecodeError, ValueError):
                    return {
                        "summary": raw_response,
                        "what_to_try": [],
                        "seek_care_if": [],
                        "sources": sources,
                        "grounded": grounded,
                        "conversational": False
                    }

            return {
                "summary": "LLM service is currently unavailable.",
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False,
                "conversational": False
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "summary": f"An internal error occurred: {str(e)}",
                "what_to_try": [],
                "seek_care_if": [],
                "sources": [],
                "grounded": False,
                "conversational": False
            }