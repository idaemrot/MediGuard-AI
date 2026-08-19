import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatConversation from '@/components/chat/ChatConversation';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-[320px] sm:w-[360px] h-[440px] flex flex-col shadow-lg">
          <div className="flex items-center justify-between border border-b-0 border-border bg-card rounded-t-md px-3 py-2">
            <span className="text-sm font-medium">MediGuard Assistant</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ChatConversation variant="compact" className="flex-1 rounded-t-none" />
        </div>
      )}

      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </Button>
    </div>
  );
};

export default FloatingChatbot;
