import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Heart, Activity, ArrowRight, Microscope, Waves } from "lucide-react";

const Screening = () => {
  const tools = [
    {
      title: "Diabetes",
      description: "Screen type-2 diabetes risk using metabolic parameters.",
      icon: <Droplets className="w-5 h-5" />,
      link: "/diabetes"
    },
    {
      title: "Heart Disease",
      description: "Estimate cardiovascular risk using clinical markers.",
      icon: <Heart className="w-5 h-5" />,
      link: "/heart"
    },
    {
      title: "Parkinson's Disease",
      description: "Voice-based screening using acoustic biomarkers.",
      icon: <Activity className="w-5 h-5" />,
      link: "/parkinsons"
    },
    {
      title: "Breast Cancer",
      description: "Screening using clinical cell-nuclei parameters.",
      icon: <Microscope className="w-5 h-5" />,
      link: "/cancer"
    },
    {
      title: "Kidney Disease",
      description: "Chronic kidney disease risk evaluation using lab markers.",
      icon: <Waves className="w-5 h-5" />,
      link: "/kidney"
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Health Screening</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Statistical risk-estimation tools trained on clinical datasets. These provide an early signal, not a
          diagnosis — use the MediGuard Assistant afterward to understand a result in plain language.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool, idx) => (
          <Link key={idx} to={tool.link} className="group">
            <Card className="h-full border-border transition-colors group-hover:border-foreground/30">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="p-2 border border-border rounded-md text-foreground/70 shrink-0">
                  {tool.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-xs font-medium text-foreground/60 group-hover:text-foreground">
                  Open screening <ArrowRight className="ml-1.5 w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-md border border-dashed border-border text-sm text-muted-foreground">
        <b className="text-foreground/80">Disclaimer:</b> These tools provide risk estimation based on model
        patterns and clinical literature. They are not a substitute for clinical diagnosis or professional
        medical advice.
      </div>
    </div>
  );
};

export default Screening;
