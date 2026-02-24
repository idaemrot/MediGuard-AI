import joblib
import os
from pathlib import Path

# Base directory for models
MODELS_DIR = Path(__file__).parent / "models"

def load_model(filename: str):
    """Loads a pickle/sav model from the models directory."""
    path = MODELS_DIR / filename
    if not path.exists():
        print(f"Warning: Model file {filename} not found at {path}")
        return None
    try:
        return joblib.load(path)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return None

# Pre-load models
diabetes_model = load_model("diabetes_model.sav")
heart_disease_model = load_model("heart_disease_model.sav")
parkinsons_model = load_model("parkinsons_model.sav")
cancer_model = load_model("cancer.pkl")
kidney_model = load_model("kidney.pkl")