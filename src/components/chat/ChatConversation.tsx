import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Send, Loader2, CheckCircle2, AlertCircle, BookOpen, Plus } from "lucide-react";
import { sendChatMessage } from '@/api/client';
import type { MedicalResponse, ChatMessage as Message } from '@/api/types';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '@/lib/chatStorage';
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

/**
 * Defensive recovery for a confirmed intermittent backend formatting slip: the
 * LLM occasionally omits the closing "]" for the last array field before the
 * final "}" (e.g. ...,"seek_care_if":["..."} instead of ...,"seek_care_if":["..."]}).
 * When that happens, the backend's own JSON parse fails and its fallback puts the
 * raw (near-valid) JSON text straight into `summary`, with what_to_try/seek_care_if
 * left empty. Recover the structured fields client-side rather than showing the
 * raw blob. `sources`/`grounded`/`conversational` are computed independently on
 * the backend and are unaffected either way, so they're left untouched.
 */
function recoverStructuredSummary(content: MedicalResponse): MedicalResponse {
  const trimmed = content.summary.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return content;

  // Try the text as-is first, then the specific missing-bracket repair.
  const candidates = [trimmed, trimmed.slice(0, -1) + ']}'];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed.summary === 'string') {
        return {
          ...content,
          summary: parsed.summary,
          what_to_try: Array.isArray(parsed.what_to_try) ? parsed.what_to_try : content.what_to_try,
          seek_care_if: Array.isArray(parsed.seek_care_if) ? parsed.seek_care_if : content.seek_care_if,
        };
      }
    } catch {
      // Not recoverable this way — try the next candidate, or fall through to raw text.
    }
  }
  return content;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  variant = 'full',
  initialMessage,
  onInitialMessageSent,
  className
}) => {
  const compact = variant === 'compact';
  const [messages, setMessages] = useState<Message[]>(() => loadChatHistory() ?? [GREETING]);
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

  // Persist on every change. `isLoading` is separate transient state and never
  // part of `messages`, so in-flight requests are never written to storage.
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const [showResetDialog, setShowResetDialog] = useState(false);

  const resetConversation = () => {
    clearChatHistory();
    setMessages([GREETING]);
  };

  const handleNewConversationClick = () => {
    const hasConversation = messages.some((m) => m.role === 'user');
    if (!hasConversation) {
      resetConversation();
      return;
    }
    setShowResetDialog(true);
  };

  const confirmNewConversation = () => {
    resetConversation();
    setShowResetDialog(false);
  };

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

    const resolved = recoverStructuredSummary(content);

    return (
      <div className={cn("space-y-3", compact && "space-y-2")}>
        {!content.conversational && typeof content.grounded === 'boolean' && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/50">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              content.grounded ? "bg-foreground/60" : "bg-foreground/25"
            )} />
            {content.grounded ? "Grounded in medical literature" : "General medical guidance"}
          </div>
        )}
        <p className="leading-relaxed">{resolved.summary}</p>

        {resolved.what_to_try.length > 0 && (
          <div className="border-l-2 border-border pl-3">
            <div className="flex items-center gap-1.5 mb-1 text-foreground/70 font-semibold text-[11px] uppercase tracking-wide">
              <CheckCircle2 className="w-3 h-3" /> Suggested steps
            </div>
            <ul className="space-y-1">
              {resolved.what_to_try.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {resolved.seek_care_if.length > 0 && (
          <div className="border-l-2 border-destructive/50 pl-3">
            <div className="flex items-center gap-1.5 mb-1 text-destructive font-semibold text-[11px] uppercase tracking-wide">
              <AlertCircle className="w-3 h-3" /> Seek care if
            </div>
            <ul className="space-y-1">
              {resolved.seek_care_if.map((item, i) => (
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
      <div className={cn(
        "flex items-center justify-between gap-3 border-b border-border flex-wrap",
        compact ? "px-3 py-1.5" : "px-4 py-2"
      )}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNewConversationClick}
          className="h-auto py-1 px-2 gap-1 text-xs text-foreground/70 hover:text-foreground"
        >
          <Plus className="w-3.5 h-3.5" /> New conversation
        </Button>
        <span className="text-[10px] text-foreground/40">
          Chat history is stored locally on this device.
        </span>
      </div>
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

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current conversation will be cleared from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmNewConversation}
              className={buttonVariants({ variant: "destructive" })}
            >
              New conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatConversation;
