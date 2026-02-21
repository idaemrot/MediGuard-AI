import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendChatMessage } from '@/api/client';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: {
        summary: "Hello! I'm your MediGuard AI Assistant. I can answer questions based on medical literature. How can I help you today?",
        what_to_try: [],
        seek_care_if: []
      },
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error("Failed to get a response from the assistant.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBotMessage = (content: string | MedicalResponse) => {
    if (typeof content === 'string') return content;
    
    return (
      <div className="space-y-3">
        <p className="font-medium leading-relaxed">{content.summary}</p>
        
        {content.what_to_try.length > 0 && (
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" /> Suggested Actions
            </div>
            <ul className="space-y-1">
              {content.what_to_try.map((item, i) => (
                <li key={i} className="text-xs text-slate-700 flex gap-2">
                  <span className="text-blue-400">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.seek_care_if.length > 0 && (
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-[10px] uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" /> Seek Care If
            </div>
            <ul className="space-y-1">
              {content.seek_care_if.map((item, i) => (
                <li key={i} className="text-xs text-slate-700 flex gap-2">
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
    <div className="container mx-auto py-8 px-4 max-w-4xl h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Medical AI Assistant</h1>
          <p className="text-muted-foreground">Structured guidance grounded in medical literature.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  msg.role === 'user' ? "bg-blue-600" : "bg-indigo-600"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white border border-slate-100 rounded-tl-none text-slate-800"
                )}>
                  {msg.role === 'user' ? (msg.content as string) : renderBotMessage(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 mr-auto">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-white border shadow-sm rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-500">Analyzing literature...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white/80">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Describe your symptoms or ask a health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-12 rounded-full px-6 border-slate-200 focus-visible:ring-indigo-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-3 h-3" />
            Grounded in Medical Literature
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;