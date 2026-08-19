import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { sendChatMessage } from '@/api/client';
import type { MedicalResponse, ChatMessage as Message } from '@/api/types';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GREETING: Message = {
  role: 'bot',
  content: {
    summary: "Hello. I'm the MediGuard Assistant. Ask a health question and I'll answer using retrieved medical literature where available.",
    what_to_try: [],
    seek_care_if: []
  },
  timestamp: new Date()
};

interface ChatConversationProps {
  variant?: 'full' | 'compact';
  initialMessage?: string;
  onInitialMessageSent?: () => void;
  className?: string;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  variant = 'full',
  initialMessage,
  onInitialMessageSent,
  className
}) => {
  const compact = variant === 'compact';
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const consumedInitialMessage = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const submitMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setIsLoading(true);
    try {
      const response = await sendChatMessage(text);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: response.data.response,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      toast.error("Failed to reach the assistant. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMessage && !consumedInitialMessage.current) {
      consumedInitialMessage.current = true;
      submitMessage(initialMessage);
      onInitialMessageSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    await submitMessage(text);
  };

  const renderBotMessage = (content: string | MedicalResponse) => {
    if (typeof content === 'string') return content;

    return (
      <div className={cn("space-y-3", compact && "space-y-2")}>
        {typeof content.grounded === 'boolean' && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/50">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              content.grounded ? "bg-foreground/60" : "bg-foreground/25"
            )} />
            {content.grounded ? "Grounded in medical literature" : "General medical guidance"}
          </div>
        )}
        <p className="leading-relaxed">{content.summary}</p>

        {content.what_to_try.length > 0 && (
          <div className="border-l-2 border-border pl-3">
            <div className="flex items-center gap-1.5 mb-1 text-foreground/70 font-semibold text-[11px] uppercase tracking-wide">
              <CheckCircle2 className="w-3 h-3" /> Suggested steps
            </div>
            <ul className="space-y-1">
              {content.what_to_try.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {content.seek_care_if.length > 0 && (
          <div className="border-l-2 border-destructive/50 pl-3">
            <div className="flex items-center gap-1.5 mb-1 text-destructive font-semibold text-[11px] uppercase tracking-wide">
              <AlertCircle className="w-3 h-3" /> Seek care if
            </div>
            <ul className="space-y-1">
              {content.seek_care_if.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {content.sources && content.sources.length > 0 && (
          <details className="rounded-md border border-border bg-muted/40 px-3 py-2">
            <summary className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/60 cursor-pointer select-none">
              <BookOpen className="w-3 h-3" /> Referenced literature ({content.sources.length})
            </summary>
            <ul className="mt-2 space-y-2">
              {content.sources.map((excerpt, i) => (
                <li key={i} className="text-xs italic text-foreground/60 leading-relaxed">
                  "{excerpt}"
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col border border-border rounded-md bg-card overflow-hidden", className)}>
      <ScrollArea className={cn("flex-1", compact ? "p-3" : "p-4")} ref={scrollRef}>
        <div className={cn("space-y-4", compact && "space-y-3")}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex flex-col max-w-[90%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40 mb-1 px-1">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <div className={cn(
                "rounded-md border text-sm",
                compact ? "px-3 py-2" : "px-4 py-3",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-foreground"
              )}>
                {msg.role === 'user' ? (msg.content as string) : renderBotMessage(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start max-w-[90%] mr-auto">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40 mb-1 px-1">Assistant</span>
              <div className={cn(
                "rounded-md border border-border bg-background flex items-center gap-2 text-sm text-muted-foreground",
                compact ? "px-3 py-2" : "px-4 py-3"
              )}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Searching medical literature…
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className={cn("flex gap-2 border-t border-border bg-card", compact ? "p-2" : "p-3")}>
        <Input
          placeholder="Ask a health question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(compact && "h-9 text-sm")}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className={cn(compact && "h-9 w-9 shrink-0")}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatConversation;
