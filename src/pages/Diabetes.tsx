import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplets, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { predictDiabetes, checkHealth } from '@/api/client';
import { toast } from "sonner";

const Diabetes = () => {
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Pregnancies: 0,
    Glucose: 100,
    BloodPressure: 70,
    SkinThickness: 20,
    Insulin: 80,
    BMI: 25.0,
    DiabetesPedigreeFunction: 0.47,
    Age: 30
  });

  useEffect(() => {
    const verifyModel = async () => {
      try {
        const res = await checkHealth();
        setModelReady(res.data.models.diabetes);
      } catch (e) {
        setModelReady(false);
      }
    };
    verifyModel();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await predictDiabetes(formData);
      setResult(response.data.prediction);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to get prediction.");
    } finally {
      setLoading(false);
    }
  };

  if (modelReady === false) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Model Unavailable</h2>
        <p className="text-muted-foreground mt-2">The Diabetes analysis model is not loaded on the server.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <Droplets className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Diabetes Risk Assessment</h1>
          <p className="text-muted-foreground">Screen type-2 diabetes risk using clinical parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Patient Profile</CardTitle>
            <CardDescription>Enter values from recent clinical reports.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="Pregnancies">Pregnancies</Label>
              <Input id="Pregnancies" name="Pregnancies" type="number" min="0" max="20" value={formData.Pregnancies} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Glucose">Glucose Level (mg/dL)</Label>
              <Input id="Glucose" name="Glucose" type="number" min="0" max="500" value={formData.Glucose} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="BloodPressure">Blood Pressure (mm Hg)</Label>
              <Input id="BloodPressure" name="BloodPressure" type="number" min="0" max="200" value={formData.BloodPressure} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="SkinThickness">Skin Thickness (mm)</Label>
              <Input id="SkinThickness" name="SkinThickness" type="number" min="0" max="100" value={formData.SkinThickness} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Insulin">Insulin Level (µU/mL)</Label>
              <Input id="Insulin" name="Insulin" type="number" min="0" max="1000" value={formData.Insulin} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="BMI">Body Mass Index (BMI)</Label>
              <Input id="BMI" name="BMI" type="number" step="0.1" min="10" max="70" value={formData.BMI} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="DiabetesPedigreeFunction">Diabetes Pedigree Function</Label>
              <Input id="DiabetesPedigreeFunction" name="DiabetesPedigreeFunction" type="number" step="0.001" min="0" max="3" value={formData.DiabetesPedigreeFunction} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Age">Age (years)</Label>
              <Input id="Age" name="Age" type="number" min="1" max="120" value={formData.Age} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 shadow-xl transition-all" disabled={loading || modelReady === null}>
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Run Diabetes Risk Analysis"}
        </Button>
      </form>

      {result !== null && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result === 1 ? (
            <Card className="bg-red-50 border-red-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <AlertTriangle className="w-10 h-10 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-900">High Risk Detected</h3>
                  <p className="text-red-700 mt-1">The model detected a pattern consistent with elevated risk. Please consult a healthcare professional.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-emerald-50 border-emerald-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Low Risk Detected</h3>
                  <p className="text-emerald-700 mt-1">Based on the information provided, the model did not detect strong indicators of this condition.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Diabetes;