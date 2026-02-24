import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { predictKidney, checkHealth } from '@/api/client';
import { toast } from "sonner";

const Kidney = () => {
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    age: 48, bp: 80, al: 1, su: 0, rbc: 1, pc: 1, pcc: 0, ba: 0,
    bgr: 121, bu: 36, sc: 1.2, pot: 4.5, wc: 7800,
    htn: 1, dm: 1, cad: 0, pe: 0, ane: 0
  });

  useEffect(() => {
    const verifyModel = async () => {
      try {
        const res = await checkHealth();
        setModelReady(res.data.models.kidney);
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
      const response = await predictKidney(formData);
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
        <p className="text-muted-foreground mt-2">The Kidney analysis model is not loaded on the server.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-2xl">
          <Activity className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kidney Disease Screening</h1>
          <p className="text-muted-foreground">Evaluate chronic kidney disease risk using clinical parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Clinical Profile</CardTitle>
            <CardDescription>Enter values from recent laboratory reports.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Age (years)</Label>
              <Input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Blood Pressure (mm/Hg)</Label>
              <Input type="number" value={formData.bp} onChange={(e) => handleChange('bp', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Albumin (0-5)</Label>
              <Input type="number" min="0" max="5" value={formData.al} onChange={(e) => handleChange('al', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sugar (0-5)</Label>
              <Input type="number" min="0" max="5" value={formData.su} onChange={(e) => handleChange('su', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Red Blood Cells</Label>
              <Select value={formData.rbc.toString()} onValueChange={(v) => handleChange('rbc', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="0">Abnormal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pus Cell</Label>
              <Select value={formData.pc.toString()} onValueChange={(v) => handleChange('pc', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="0">Abnormal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pus Cell Clumps</Label>
              <Select value={formData.pcc.toString()} onValueChange={(v) => handleChange('pcc', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Present</SelectItem>
                  <SelectItem value="0">Not Present</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bacteria</Label>
              <Select value={formData.ba.toString()} onValueChange={(v) => handleChange('ba', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Present</SelectItem>
                  <SelectItem value="0">Not Present</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Blood Glucose Random</Label>
              <Input type="number" value={formData.bgr} onChange={(e) => handleChange('bgr', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Blood Urea</Label>
              <Input type="number" value={formData.bu} onChange={(e) => handleChange('bu', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Serum Creatinine</Label>
              <Input type="number" step="0.1" value={formData.sc} onChange={(e) => handleChange('sc', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Potassium</Label>
              <Input type="number" step="0.1" value={formData.pot} onChange={(e) => handleChange('pot', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>White Blood Cell Count</Label>
              <Input type="number" value={formData.wc} onChange={(e) => handleChange('wc', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hypertension</Label>
              <Select value={formData.htn.toString()} onValueChange={(v) => handleChange('htn', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Diabetes Mellitus</Label>
              <Select value={formData.dm.toString()} onValueChange={(v) => handleChange('dm', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Coronary Artery Disease</Label>
              <Select value={formData.cad.toString()} onValueChange={(v) => handleChange('cad', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pedal Edema</Label>
              <Select value={formData.pe.toString()} onValueChange={(v) => handleChange('pe', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Anemia</Label>
              <Select value={formData.ane.toString()} onValueChange={(v) => handleChange('ane', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-xl transition-all" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Run Kidney Risk Analysis"}
        </Button>
      </form>

      {result !== null && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result === 1 ? (
            <Card className="bg-red-50 border-red-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <AlertTriangle className="w-10 h-10 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-900">CKD Pattern Detected</h3>
                  <p className="text-red-700 mt-1">The model detected a pattern consistent with Chronic Kidney Disease. Please consult a nephrologist.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-emerald-50 border-emerald-200 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">No CKD Pattern Detected</h3>
                  <p className="text-emerald-700 mt-1">Based on the information provided, the model did not detect strong indicators of kidney disease.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Kidney;