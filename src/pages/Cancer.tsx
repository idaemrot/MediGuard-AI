import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Microscope, AlertTriangle, CheckCircle2, Loader2, ChevronRight, ChevronLeft, ShieldAlert } from "lucide-react";
import { predictCancer, checkHealth } from '@/api/client';
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Cancer = () => {
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    radius_mean: 14.0, texture_mean: 19.0, perimeter_mean: 90.0, area_mean: 600.0,
    smoothness_mean: 0.1, compactness_mean: 0.1, concavity_mean: 0.1, concave_points_mean: 0.05,
    symmetry_mean: 0.18, radius_se: 0.4, perimeter_se: 2.8, area_se: 40.0,
    compactness_se: 0.02, concavity_se: 0.03, concave_points_se: 0.01, fractal_dimension_se: 0.003,
    radius_worst: 16.0, texture_worst: 25.0, perimeter_worst: 100.0, area_worst: 800.0,
    smoothness_worst: 0.13, compactness_worst: 0.25, concavity_worst: 0.3, concave_points_worst: 0.1,
    symmetry_worst: 0.29, fractal_dimension_worst: 0.08
  });

  useEffect(() => {
    const verifyModel = async () => {
      try {
        const res = await checkHealth();
        setModelReady(res.data.models.cancer);
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
      const response = await predictCancer(formData);
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
        <p className="text-muted-foreground mt-2">The Cancer analysis model is not loaded on the server.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-rose-100 rounded-2xl">
          <Microscope className="w-8 h-8 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Breast Cancer Screening</h1>
          <p className="text-muted-foreground">Step {step} of 3: Clinical Parameters</p>
        </div>
      </div>

      <Progress value={(step / 3) * 100} className="mb-8 h-2" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>Mean Measurements</CardTitle>
              <CardDescription>Average values for the cell nuclei.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Radius Mean</Label><Input name="radius_mean" type="number" step="0.01" value={formData.radius_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Texture Mean</Label><Input name="texture_mean" type="number" step="0.01" value={formData.texture_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Perimeter Mean</Label><Input name="perimeter_mean" type="number" step="0.01" value={formData.perimeter_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Area Mean</Label><Input name="area_mean" type="number" step="0.01" value={formData.area_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Smoothness Mean</Label><Input name="smoothness_mean" type="number" step="0.0001" value={formData.smoothness_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Compactness Mean</Label><Input name="compactness_mean" type="number" step="0.0001" value={formData.compactness_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concavity Mean</Label><Input name="concavity_mean" type="number" step="0.0001" value={formData.concavity_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concave Points Mean</Label><Input name="concave_points_mean" type="number" step="0.0001" value={formData.concave_points_mean} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Symmetry Mean</Label><Input name="symmetry_mean" type="number" step="0.0001" value={formData.symmetry_mean} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>Standard Error Measurements</CardTitle>
              <CardDescription>Variation in measurements across the sample.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Radius SE</Label><Input name="radius_se" type="number" step="0.001" value={formData.radius_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Perimeter SE</Label><Input name="perimeter_se" type="number" step="0.001" value={formData.perimeter_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Area SE</Label><Input name="area_se" type="number" step="0.01" value={formData.area_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Compactness SE</Label><Input name="compactness_se" type="number" step="0.0001" value={formData.compactness_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concavity SE</Label><Input name="concavity_se" type="number" step="0.0001" value={formData.concavity_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concave Points SE</Label><Input name="concave_points_se" type="number" step="0.0001" value={formData.concave_points_se} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Fractal Dimension SE</Label><Input name="fractal_dimension_se" type="number" step="0.0001" value={formData.fractal_dimension_se} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>Worst Measurements</CardTitle>
              <CardDescription>Largest values observed in the sample.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Radius Worst</Label><Input name="radius_worst" type="number" step="0.01" value={formData.radius_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Texture Worst</Label><Input name="texture_worst" type="number" step="0.01" value={formData.texture_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Perimeter Worst</Label><Input name="perimeter_worst" type="number" step="0.01" value={formData.perimeter_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Area Worst</Label><Input name="area_worst" type="number" step="0.01" value={formData.area_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Smoothness Worst</Label><Input name="smoothness_worst" type="number" step="0.0001" value={formData.smoothness_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Compactness Worst</Label><Input name="compactness_worst" type="number" step="0.0001" value={formData.compactness_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concavity Worst</Label><Input name="concavity_worst" type="number" step="0.0001" value={formData.concavity_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Concave Points Worst</Label><Input name="concave_points_worst" type="number" step="0.0001" value={formData.concave_points_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Symmetry Worst</Label><Input name="symmetry_worst" type="number" step="0.0001" value={formData.symmetry_worst} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Fractal Dimension Worst</Label><Input name="fractal_dimension_worst" type="number" step="0.0001" value={formData.fractal_dimension_worst} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1 bg-gradient-to-r from-rose-600 to-pink-500" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Run Cancer Analysis"}
            </Button>
          )}
        </div>
      </form>

      {result !== null && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result === 1 ? (
            <Card className="bg-red-50 border-red-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <AlertTriangle className="w-10 h-10 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-900">Malignant Pattern Detected</h3>
                  <p className="text-red-700 mt-1">The model detected a pattern consistent with malignancy. Immediate consultation with an oncologist is recommended.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-emerald-50 border-emerald-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Benign Pattern Detected</h3>
                  <p className="text-emerald-700 mt-1">Based on the information provided, the model detected a pattern consistent with benign findings.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Cancer;