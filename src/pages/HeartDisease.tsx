import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { predictHeart } from '@/api/client';
import { toast } from "sonner";

const HeartDisease = () => {
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-red-100 rounded-2xl">
          <Heart className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Cardiovascular Risk Evaluation</h1>
          <p className="text-muted-foreground">Estimate the presence of heart disease using cardiology parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
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

        <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-xl transition-all" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Run Cardiac Risk Evaluation"}
        </Button>
      </form>

      {result !== null && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result === 1 ? (
            <Card className="bg-red-50 border-red-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <AlertTriangle className="w-10 h-10 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-900">Alert: Model Suggests Cardiac Disease Pattern</h3>
                  <p className="text-red-700 mt-1">The model detected a pattern consistent with elevated risk. Please consult a cardiologist.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-emerald-50 border-emerald-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Reassuring: No Strong Cardiac Disease Pattern Detected</h3>
                  <p className="text-emerald-700 mt-1">Based on the information provided, the model did not detect strong indicators of heart disease.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default HeartDisease;