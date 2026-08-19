import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2 } from "lucide-react";
import { predictHeart, checkHealth } from '@/api/client';
import { toast } from "sonner";
import ScreeningResult from '@/components/screening/ScreeningResult';
import ModelUnavailable from '@/components/screening/ModelUnavailable';

const HeartDisease = () => {
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    age: 50,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 0,
    ca: 0,
    thal: 1
  });

  useEffect(() => {
    const verifyModel = async () => {
      try {
        const res = await checkHealth();
        setModelReady(res.data.models.heart);
      } catch (e) {
        setModelReady(false);
      }
    };
    verifyModel();
  }, []);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await predictHeart(formData);
      setResult(response.data.prediction);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to get prediction. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (modelReady === false) {
    return <ModelUnavailable label="Heart Disease" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 border border-border rounded-md">
          <Heart className="w-6 h-6 text-foreground/70" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cardiovascular Risk Evaluation</h1>
          <p className="text-muted-foreground text-sm">Estimate the presence of heart disease using cardiology parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Profile</CardTitle>
            <CardDescription>Core cardiovascular risk markers and functional test results.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Age (years)</Label>
              <Input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Select value={formData.sex.toString()} onValueChange={(v) => handleChange('sex', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Male</SelectItem>
                  <SelectItem value="0">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chest Pain Type</Label>
              <Select value={formData.cp.toString()} onValueChange={(v) => handleChange('cp', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Typical Angina</SelectItem>
                  <SelectItem value="1">Atypical Angina</SelectItem>
                  <SelectItem value="2">Non-anginal Pain</SelectItem>
                  <SelectItem value="3">Asymptomatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resting Blood Pressure</Label>
              <Input type="number" value={formData.trestbps} onChange={(e) => handleChange('trestbps', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Serum Cholesterol</Label>
              <Input type="number" value={formData.chol} onChange={(e) => handleChange('chol', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fasting Blood Sugar {'>'} 120</Label>
              <Select value={formData.fbs.toString()} onValueChange={(v) => handleChange('fbs', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resting ECG Result</Label>
              <Select value={formData.restecg.toString()} onValueChange={(v) => handleChange('restecg', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">ST-T Wave Abnormality</SelectItem>
                  <SelectItem value="2">LV Hypertrophy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Heart Rate</Label>
              <Input type="number" value={formData.thalach} onChange={(e) => handleChange('thalach', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Exercise Induced Angina</Label>
              <Select value={formData.exang.toString()} onValueChange={(v) => handleChange('exang', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ST Depression (Oldpeak)</Label>
              <Input type="number" step="0.1" value={formData.oldpeak} onChange={(e) => handleChange('oldpeak', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slope of Peak ST</Label>
              <Select value={formData.slope.toString()} onValueChange={(v) => handleChange('slope', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Upsloping</SelectItem>
                  <SelectItem value="1">Flat</SelectItem>
                  <SelectItem value="2">Downsloping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Major Vessels (0-3)</Label>
              <Input type="number" min="0" max="3" value={formData.ca} onChange={(e) => handleChange('ca', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Thalassemia</Label>
              <Select value={formData.thal.toString()} onValueChange={(v) => handleChange('thal', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Unknown</SelectItem>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="2">Fixed Defect</SelectItem>
                  <SelectItem value="3">Reversible Defect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-11" disabled={loading || modelReady === null}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</> : "Run Cardiac Risk Evaluation"}
        </Button>
      </form>

      {result !== null && (
        <ScreeningResult
          disease="Heart Disease"
          isPositive={result === 1}
          title={result === 1 ? "Cardiac disease pattern detected" : "No strong cardiac disease pattern detected"}
          message={
            result === 1
              ? "The model detected a pattern consistent with elevated risk. Please consult a cardiologist."
              : "Based on the information provided, the model did not detect strong indicators of heart disease."
          }
          assistantQuestion={
            result === 1
              ? "My heart disease screening showed elevated risk — what does that mean and what should I do next?"
              : "My heart disease screening showed low risk — what does that mean and should I still take any precautions?"
          }
        />
      )}
    </div>
  );
};

export default HeartDisease;
