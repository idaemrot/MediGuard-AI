import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { predictParkinsons, checkHealth } from '@/api/client';
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import ModelUnavailable from '@/components/screening/ModelUnavailable';
import ScreeningResult from '@/components/screening/ScreeningResult';

const Parkinsons = () => {
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fo: 119.99, fhi: 157.30, flo: 74.99,
    jitter_percent: 0.00784, jitter_abs: 0.00007, rap: 0.00370, ppq: 0.00554, ddp: 0.01109,
    shimmer: 0.04374, shimmer_db: 0.426, apq3: 0.02182, apq5: 0.03130, apq: 0.02971, dda: 0.06545,
    nhr: 0.02211, hnr: 21.033, rpde: 0.414783, dfa: 0.815285,
    spread1: -4.813031, spread2: 0.266482, d2: 2.301442, ppe: 0.284654
  });

  useEffect(() => {
    const verifyModel = async () => {
      try {
        const res = await checkHealth();
        setModelReady(res.data.models.parkinsons);
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
      const response = await predictParkinsons(formData);
      setResult(response.data.prediction);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to get prediction. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (modelReady === false) {
    return <ModelUnavailable label="Parkinson's" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 border border-border rounded-md">
          <Activity className="w-6 h-6 text-foreground/70" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parkinson's Voice Screening</h1>
          <p className="text-muted-foreground text-sm">Step {step} of 4: Acoustic Biomarkers</p>
        </div>
      </div>

      <Progress value={(step / 4) * 100} className="mb-8 h-1.5" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Frequency Parameters</CardTitle>
              <CardDescription>Fundamental frequency measurements in Hertz.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>MDVP:Fo(Hz)</Label>
                <Input name="fo" type="number" step="0.01" value={formData.fo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>MDVP:Fhi(Hz)</Label>
                <Input name="fhi" type="number" step="0.01" value={formData.fhi} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>MDVP:Flo(Hz)</Label>
                <Input name="flo" type="number" step="0.01" value={formData.flo} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Jitter Metrics</CardTitle>
              <CardDescription>Measures of variation in fundamental frequency.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Jitter(%)</Label><Input name="jitter_percent" type="number" step="0.00001" value={formData.jitter_percent} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Jitter(Abs)</Label><Input name="jitter_abs" type="number" step="0.00001" value={formData.jitter_abs} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>RAP</Label><Input name="rap" type="number" step="0.00001" value={formData.rap} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>PPQ</Label><Input name="ppq" type="number" step="0.00001" value={formData.ppq} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>DDP</Label><Input name="ddp" type="number" step="0.00001" value={formData.ddp} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Shimmer Metrics</CardTitle>
              <CardDescription>Measures of variation in amplitude.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Shimmer</Label><Input name="shimmer" type="number" step="0.00001" value={formData.shimmer} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Shimmer(dB)</Label><Input name="shimmer_db" type="number" step="0.001" value={formData.shimmer_db} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>APQ3</Label><Input name="apq3" type="number" step="0.00001" value={formData.apq3} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>APQ5</Label><Input name="apq5" type="number" step="0.00001" value={formData.apq5} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>APQ</Label><Input name="apq" type="number" step="0.00001" value={formData.apq} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>DDA</Label><Input name="dda" type="number" step="0.00001" value={formData.dda} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Harmonicity & Dynamics</CardTitle>
              <CardDescription>Non-linear measures of voice signal complexity.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>NHR</Label><Input name="nhr" type="number" step="0.00001" value={formData.nhr} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>HNR</Label><Input name="hnr" type="number" step="0.001" value={formData.hnr} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>RPDE</Label><Input name="rpde" type="number" step="0.000001" value={formData.rpde} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>DFA</Label><Input name="dfa" type="number" step="0.000001" value={formData.dfa} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>spread1</Label><Input name="spread1" type="number" step="0.000001" value={formData.spread1} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>spread2</Label><Input name="spread2" type="number" step="0.000001" value={formData.spread2} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>D2</Label><Input name="d2" type="number" step="0.000001" value={formData.d2} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>PPE</Label><Input name="ppe" type="number" step="0.000001" value={formData.ppe} onChange={handleChange} /></div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" className="flex-1" onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Run Analysis"}
            </Button>
          )}
        </div>
      </form>

      {result !== null && (
        <ScreeningResult
          disease="Parkinson's"
          isPositive={result === 1}
          title={result === 1 ? "Positive screen detected" : "Negative screen detected"}
          message={
            result === 1
              ? "The model detected a pattern consistent with Parkinson's disease. Please consult a neurologist."
              : "Based on the information provided, the model did not detect strong indicators of Parkinson's."
          }
          assistantQuestion={
            result === 1
              ? "My Parkinson's voice screening was positive — what does that mean and what should I do next?"
              : "My Parkinson's voice screening was negative — what does that mean and should I still take any precautions?"
          }
        />
      )}
    </div>
  );
};

export default Parkinsons;
