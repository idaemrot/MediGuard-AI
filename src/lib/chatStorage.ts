import type { ChatMessage, MedicalResponse } from '@/api/types';

const STORAGE_KEY = 'mediguard-chat-history';

function isValidMedicalResponse(value: unknown): value is MedicalResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.summary === 'string' &&
    Array.isArray(v.what_to_try) &&
    Array.isArray(v.seek_care_if)
  );
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  if (v.role !== 'user' && v.role !== 'bot') return false;
  if (typeof v.content !== 'string' && !isValidMedicalResponse(v.content)) return false;
  if (typeof v.timestamp !== 'string') return false;
  if (Number.isNaN(new Date(v.timestamp as string).getTime())) return false;

  return true;
}

/**
 * Reads and validates the persisted conversation. Returns null if nothing is
 * stored, or if the stored data is missing, corrupted, or doesn't match the
 * expected shape — callers should fall back to the default greeting in that case.
 * Never throws: any localStorage or parsing failure is treated as "nothing stored".
 */
export function loadChatHistory(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(isValidMessage)) return null;

    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return null;
  }
}

/**
 * Persists the current conversation. Silently no-ops on failure (storage full,
 * disabled, private-browsing restrictions, etc.) — the chat keeps working
 * in-memory for the session either way.
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore — persistence is a convenience, not a requirement for the chat to work.
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
