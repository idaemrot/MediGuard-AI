from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from utils import diabetes_model, heart_disease_model, parkinsons_model, cancer_model, kidney_model
from chatbot.rag_engine import MedicalRAG

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="MediGuard API", description="AI Health Assistant Backend with RAG Chatbot")

# Configurable CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
rag_engine = MedicalRAG()

@app.on_event("startup")
async def startup_event():
    """Initializes the RAG engine when the server starts."""
    rag_engine.initialize()

# --- Request Schemas ---

class DiabetesInput(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float

class HeartInput(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

class ParkinsonsInput(BaseModel):
    fo: float
    fhi: float
    flo: float
    jitter_percent: float
    jitter_abs: float
    rap: float
    ppq: float
    ddp: float
    shimmer: float
    shimmer_db: float
    apq3: float
    apq5: float
    apq: float
    dda: float
    nhr: float
    hnr: float
    rpde: float
    dfa: float
    spread1: float
    spread2: float
    d2: float
    ppe: float

class CancerInput(BaseModel):
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float
    smoothness_mean: float
    compactness_mean: float
    concavity_mean: float
    concave_points_mean: float
    symmetry_mean: float
    radius_se: float
    perimeter_se: float
    area_se: float
    compactness_se: float
    concavity_se: float
    concave_points_se: float
    fractal_dimension_se: float
    radius_worst: float
    texture_worst: float
    perimeter_worst: float
    area_worst: float
    smoothness_worst: float
    compactness_worst: float
    concavity_worst: float
    concave_points_worst: float
    symmetry_worst: float
    fractal_dimension_worst: float

class KidneyInput(BaseModel):
    age: float
    bp: float
    al: float
    su: float
    rbc: float
    pc: float
    pcc: float
    ba: float
    bgr: float
    bu: float
    sc: float
    pot: float
    wc: float
    htn: float
    dm: float
    cad: float
    pe: float
    ane: float

class ChatInput(BaseModel):
    message: str

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "MediGuard API is running"}

@app.get("/health")
async def health_check():
    """Checks if models and RAG engine are loaded and ready."""
    return {
        "status": "ready",
        "models": {
            "diabetes": diabetes_model is not None,
            "heart": heart_disease_model is not None,
            "parkinsons": parkinsons_model is not None,
            "cancer": cancer_model is not None,
            "kidney": kidney_model is not None
        },
        "chatbot": {
            "initialized": rag_engine.is_initialized
        }
    }

@app.post("/chat")
async def chat_endpoint(data: ChatInput):
    """RAG-powered medical chatbot endpoint."""
    response = rag_engine.get_response(data.message)
    return {"response": response}

@app.post("/predict/diabetes")
async def predict_diabetes(data: DiabetesInput):
    if diabetes_model is None:
        raise HTTPException(status_code=503, detail="Diabetes model not loaded")
    
    features = [
        data.Pregnancies, data.Glucose, data.BloodPressure, data.SkinThickness,
        data.Insulin, data.BMI, data.DiabetesPedigreeFunction, data.Age
    ]
    prediction = diabetes_model.predict([features])
    return {"prediction": int(prediction[0])}

@app.post("/predict/heart")
async def predict_heart(data: HeartInput):
    if heart_disease_model is None:
        raise HTTPException(status_code=503, detail="Heart disease model not loaded")
    
    features = [
        data.age, data.sex, data.cp, data.trestbps, data.chol, data.fbs,
        data.restecg, data.thalach, data.exang, data.oldpeak, data.slope,
        data.ca, data.thal
    ]
    prediction = heart_disease_model.predict([features])
    return {"prediction": int(prediction[0])}

@app.post("/predict/parkinsons")
async def predict_parkinsons(data: ParkinsonsInput):
    if parkinsons_model is None:
        raise HTTPException(status_code=503, detail="Parkinson's model not loaded")
    
    features = [
        data.fo, data.fhi, data.flo, data.jitter_percent, data.jitter_abs,
        data.rap,    data.ppq, data.ddp, data.shimmer, data.shimmer_db,
        data.apq3, data.apq5, data.apq, data.dda, data.nhr, data.hnr,
        data.rpde, data.dfa, data.spread1, data.spread2, data.d2, data.ppe
    ]
    prediction = parkinsons_model.predict([features])
    return {"prediction": int(prediction[0])}

@app.post("/predict/cancer")
async def predict_cancer(data: CancerInput):
    if cancer_model is None:
        raise HTTPException(status_code=503, detail="Cancer model not loaded")
    
    features = [
        data.radius_mean, data.texture_mean, data.perimeter_mean, data.area_mean,
        data.smoothness_mean, data.compactness_mean, data.concavity_mean,
        data.concave_points_mean, data.symmetry_mean, data.radius_se,
        data.perimeter_se, data.area_se, data.compactness_se, data.concavity_se,
        data.concave_points_se, data.fractal_dimension_se, data.radius_worst,
        data.texture_worst, data.perimeter_worst, data.area_worst,
        data.smoothness_worst, data.compactness_worst, data.concavity_worst,
        data.concave_points_worst, data.symmetry_worst, data.fractal_dimension_worst
    ]
    prediction = cancer_model.predict([features])
    return {"prediction": int(prediction[0])}

@app.post("/predict/kidney")
async def predict_kidney(data: KidneyInput):
    if kidney_model is None:
        raise HTTPException(status_code=503, detail="Kidney model not loaded")
    
    features = [
        data.age, data.bp, data.al, data.su, data.rbc, data.pc, data.pcc,
        data.ba, data.bgr, data.bu, data.sc, data.pot, data.wc, data.htn,
        data.dm, data.cad, data.pe, data.ane
    ]
    prediction = kidney_model.predict([features])
    return {"prediction": int(prediction[0])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)