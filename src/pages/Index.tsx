import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Heart, Activity, ShieldCheck, ArrowRight } from "lucide-react";

const Index = () => {
  const tools = [
    {
      title: "Diabetes Prediction",
      description: "Screen type-2 diabetes risk using metabolic parameters.",
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      link: "/diabetes",
      color: "bg-blue-50",
      borderColor: "hover:border-blue-200"
    },
    {
      title: "Heart Disease",
      description: "Estimate cardiovascular risk using clinical markers.",
      icon: <Heart className="w-8 h-8 text-red-600" />,
      link: "/heart",
      color: "bg-red-50",
      borderColor: "hover:border-red-200"
    },
    {
      title: "Parkinson's Disease",
      description: "Voice-based screening using acoustic biomarkers.",
      icon: <Activity className="w-8 h-8 text-purple-600" />,
      link: "/parkinsons",
      color: "bg-purple-50",
      borderColor: "hover:border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            AI-Powered Health Screening
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            MediGuard <span className="text-blue-600">AI Assistant</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Advanced machine learning models designed for early risk detection and health information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool, idx) => (
            <Link key={idx} to={tool.link} className="group">
              <Card className={`h-full border-2 border-transparent transition-all duration-300 ${tool.borderColor} hover:shadow-2xl hover:-translate-y-1 overflow-hidden`}>
                <CardHeader className={`${tool.color} pb-8`}>
                  <div className="mb-4 p-3 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-slate-600 text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Start Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-20 max-w-2xl mx-auto p-6 rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center">
          <p className="text-sm text-slate-500 italic">
            <b>Disclaimer</b>: This assistant provides risk estimation and information based on model patterns and literature. 
            It is not a substitute for clinical diagnosis or professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;