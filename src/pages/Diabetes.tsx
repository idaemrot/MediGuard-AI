import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplets, Loader2 } from "lucide-react";
import { predictDiabetes, checkHealth } from '@/api/client';
import { toast } from "sonner";
import ModelUnavailable from '@/components/screening/ModelUnavailable';
import ScreeningResult from '@/components/screening/ScreeningResult';

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
    return <ModelUnavailable label="Diabetes" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 border border-border rounded-md">
          <Droplets className="w-6 h-6 text-foreground/70" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Diabetes Risk Assessment</h1>
          <p className="text-muted-foreground text-sm">Screen type-2 diabetes risk using clinical parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
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

        <Button type="submit" className="w-full h-11" disabled={loading || modelReady === null}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</> : "Run Diabetes Risk Analysis"}
        </Button>
      </form>

      {result !== null && (
        <ScreeningResult
          disease="Diabetes"
          isPositive={result === 1}
          title={result === 1 ? "High risk detected" : "Low risk detected"}
          message={
            result === 1
              ? "The model detected a pattern consistent with elevated risk. Please consult a healthcare professional."
              : "Based on the information provided, the model did not detect strong indicators of this condition."
          }
          assistantQuestion={
            result === 1
              ? "My diabetes screening showed elevated risk — what does that mean and what should I do next?"
              : "My diabetes screening showed low risk — what does that mean and should I still take any precautions?"
          }
        />
      )}
    </div>
  );
};

export default Diabetes;
