"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  ShieldCheck,
  Mail,
  Linkedin
} from "lucide-react";

const Team = () => {
  const students = [
    { 
      name: "MANISH DAEMROT", 
      id: "",
      role: "2K22/MC/088",
      initials: "MD"
    },
    { 
      name: "LAKSHAY KUMAR", 
      id: "",
      role: "2K22/MC/085",
      initials: "LK"
    },
    { 
      name: "GOPAL", 
      id: "",
      role: "2K22/MC/059",
      initials: "GP"
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50/50 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col justify-center max-w-6xl">
        
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3 h-3" />
            Academic Session 2025 - 2026
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Project <span className="text-blue-600">Contributors</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Supervisor Section - Left Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Project Supervision</h2>
            </div>
            
            <Card className="border-none shadow-sm bg-white flex-1 flex flex-col justify-center">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4 ring-4 ring-blue-50">
                  <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">RK</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Mr. Rohit Kumar</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-3">Assistant Professor</p>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    Department of Applied Mathematics. Providing strategic guidance and mathematical validation for the MediGuard screening models.
                  </p>
                </div>
  
              </CardContent>
            </Card>
          </div>

          {/* Students Section - Right Column */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Development Team</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 flex-1">
              {students.map((student, idx) => (
                <Card key={idx} className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-slate-50 shrink-0">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-bold">
                        {student.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{student.name}</h4>
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                        {student.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md shrink-0">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-500">{student.id}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Final Year Project • B.Tech 2025-26
          </p>
        </div>
      </div>
    </div>
  );
};

export default Team;