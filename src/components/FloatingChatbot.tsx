import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, ShieldCheck, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendChatMessage } from '@/api/client';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MedicalResponse {
  summary: string;
  what_to_try: string[];
  seek_care_if: string[];
}

interface Message {
  role: 'user' | 'bot';
  content: string | MedicalResponse;
  timestamp: Date;
}

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: {
        summary: "Hi! I'm your MediGuard assistant. How can I help you today?",
        what_to_try: [],
        seek_care_if: []
      },
      timestamp: new Date()
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.data.response, 
        timestamp: new Date() 
      }]);
    } catch (error: any) {
      toast.error("Assistant unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBotMessage = (content: string | MedicalResponse) => {
    if (typeof content === 'string') return content;
    
    return (
      <div className="space-y-2">
        <p className="font-medium">{content.summary}</p>
        
        {content.what_to_try.length > 0 && (
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
              <CheckCircle2 className="w-2.5 h-2.5" /> Actions
            </div>
            <ul className="space-y-0.5">
              {content.what_to_try.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex gap-1.5">
                  <span className="text-blue-400">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.seek_care_if.length > 0 && (
          <div className="bg-red-50/50 p-2 rounded-lg border border-red-100">
            <div className="flex items-center gap-1.5 mb-1 text-red-700 font-bold text-[9px] uppercase tracking-wider">
              <AlertCircle className="w-2.5 h-2.5" /> Warning Signs
            </div>
            <ul className="space-y-0.5">
              {content.seek_care_if.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex gap-1.5">
                  <span className="text-red-400">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {isOpen && (
        <Card className="mb-4 w-[320px] sm:w-[380px] h-[500px] flex flex-col shadow-2xl border-none overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Medical Support Bot</CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Online</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </CardHeader>

          <ScrollArea className="flex-1 p-4 bg-slate-50" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-2 max-w-[88%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === 'user' ? "bg-blue-600" : "bg-indigo-600"
                  )}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 rounded-tl-none text-slate-800"
                  )}>
                    {msg.role === 'user' ? (msg.content as string) : renderBotMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-100 rounded-tl-none flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                    <span className="text-[10px] text-slate-500 font-medium">Consulting literature...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-white">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask a medical question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
          isOpen 
            ? "bg-slate-800 rotate-90" 
            : "bg-gradient-to-br from-blue-500 to-indigo-600"
        )}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
      </button>
    </div>
  );
};

export default FloatingChatbot;