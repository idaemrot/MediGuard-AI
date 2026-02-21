from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


# ==============================
# Paths (robust)
# ==============================
BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data"
DB_FAISS_PATH = BASE_DIR / "vectorstores" / "db_faiss"


# ==============================
# Step 1: Load PDFs
# ==============================
def load_pdf_files(data_path):
    if not data_path.exists():
        raise FileNotFoundError(f"Data folder not found: {data_path}")

    loader = DirectoryLoader(
        str(data_path),
        glob="*.pdf",
        loader_cls=PyPDFLoader
    )

    documents = loader.load()

    if not documents:
        raise ValueError("No PDF files found in data folder.")

    return documents


# ==============================
# Step 2: Create Chunks
# ==============================
def create_chunks(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=100
    )
    return splitter.split_documents(documents)


# ==============================
# Step 3: Embedding Model
# ==============================
def get_embedding_model():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


# ==============================
# Step 4: Build FAISS DB
# ==============================
def build_faiss():
    print("[*] Loading PDFs...")
    documents = load_pdf_files(DATA_PATH)
    print(f"[+] Loaded {len(documents)} pages.")

    print("[*] Creating chunks...")
    text_chunks = create_chunks(documents)
    print(f"[+] Created {len(text_chunks)} chunks.")

    print("[*] Loading embedding model...")
    embedding_model = get_embedding_model()

    print("[*] Building FAISS index...")
    db = FAISS.from_documents(text_chunks, embedding_model)

    DB_FAISS_PATH.parent.mkdir(parents=True, exist_ok=True)
    db.save_local(str(DB_FAISS_PATH))

    print(f"[+] FAISS DB saved at: {DB_FAISS_PATH}")


if __name__ == "__main__":
    build_faiss()