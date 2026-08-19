import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";

interface ScreeningResultProps {
  disease: string;
  isPositive: boolean;
  title: string;
  message: string;
  assistantQuestion: string;
}

const ScreeningResult: React.FC<ScreeningResultProps> = ({
  disease,
  isPositive,
  title,
  message,
  assistantQuestion
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 space-y-3">
      <Card className={isPositive ? "border-destructive/40" : "border-border"}>
        <CardContent className="pt-6 flex gap-4">
          {isPositive ? (
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-foreground/60 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{message}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              This is a risk estimate from a statistical model, not a diagnosis.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => navigate('/', { state: { prefillQuestion: assistantQuestion } })}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Understand this result with the MediGuard Assistant
      </Button>
    </div>
  );
};

export default ScreeningResult;
