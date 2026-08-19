import React from 'react';
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface ModelUnavailableProps {
  label: string;
}

const ModelUnavailable: React.FC<ModelUnavailableProps> = ({ label }) => (
  <div className="container mx-auto py-20 px-4 text-center max-w-md">
    <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
    <h2 className="text-xl font-semibold">Model unavailable</h2>
    <p className="text-muted-foreground mt-2 text-sm">
      The {label} screening model is not loaded on the server.
    </p>
    <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
      Retry connection
    </Button>
  </div>
);

export default ModelUnavailable;
