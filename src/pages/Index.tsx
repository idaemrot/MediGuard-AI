import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from "lucide-react";
import ChatConversation from '@/components/chat/ChatConversation';

interface LocationState {
  prefillQuestion?: string;
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [prefillQuestion] = useState(state?.prefillQuestion);

  const clearPrefill = () => {
    navigate(location.pathname, { replace: true, state: {} });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl h-[calc(100vh-56px)] flex flex-col">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-border rounded-md">
            <ShieldCheck className="w-6 h-6 text-foreground/70" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">MediGuard Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Grounded in retrieved medical literature where available. Not a substitute for professional care.
            </p>
          </div>
        </div>
        <Link
          to="/screening"
          className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0 whitespace-nowrap pt-2"
        >
          Health Screening tools <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ChatConversation
        variant="full"
        className="flex-1"
        initialMessage={prefillQuestion}
        onInitialMessageSent={clearPrefill}
      />
    </div>
  );
};

export default Index;
