export interface DiabetesInput {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

export interface HeartInput {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

export interface ParkinsonsInput {
  fo: number;
  fhi: number;
  flo: number;
  jitter_percent: number;
  jitter_abs: number;
  rap: number;
  ppq: number;
  ddp: number;
  shimmer: number;
  shimmer_db: number;
  apq3: number;
  apq5: number;
  apq: number;
  dda: number;
  nhr: number;
  hnr: number;
  rpde: number;
  dfa: number;
  spread1: number;
  spread2: number;
  d2: number;
  ppe: number;
}

export interface CancerInput {
  radius_mean: number;
  texture_mean: number;
  perimeter_mean: number;
  area_mean: number;
  smoothness_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  symmetry_mean: number;
  radius_se: number;
  perimeter_se: number;
  area_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  fractal_dimension_se: number;
  radius_worst: number;
  texture_worst: number;
  perimeter_worst: number;
  area_worst: number;
  smoothness_worst: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  symmetry_worst: number;
  fractal_dimension_worst: number;
}

export interface KidneyInput {
  age: number;
  bp: number;
  al: number;
  su: number;
  rbc: number;
  pc: number;
  pcc: number;
  ba: number;
  bgr: number;
  bu: number;
  sc: number;
  pot: number;
  wc: number;
  htn: number;
  dm: number;
  cad: number;
  pe: number;
  ane: number;
}

export interface PredictionResponse {
  prediction: 0 | 1;
}

export interface HealthResponse {
  status: string;
  models: {
    diabetes: boolean;
    heart: boolean;
    parkinsons: boolean;
    cancer: boolean;
    kidney: boolean;
  };
  chatbot: {
    initialized: boolean;
  };
}

export interface MedicalResponse {
  summary: string;
  what_to_try: string[];
  seek_care_if: string[];
  sources?: string[];
  grounded?: boolean;
}

export interface ChatResponse {
  response: MedicalResponse;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string | MedicalResponse;
  timestamp: Date;
}
