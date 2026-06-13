import type { UploadResponse } from "../upload/mockApi";
import type { ChatMessage } from "../chat/mockChat";

/**
 * Session — a single upload + its associated chat conversation.
 * Persisted to localStorage so sessions survive a browser refresh.
 *
 * NOTE: we deliberately drop the original `File` object since it can't
 * be serialised. The filename and upload response are enough to restore
 * the dashboard view; new chat messages are appended in real time.
 */
export interface Session {
  id: string;
  filename: string;
  result: UploadResponse;
  messages: ChatMessage[];
  /** Unix timestamp ms — when the upload happened. */
  createdAt: number;
  /** Unix timestamp ms — last activity (latest message or creation). */
  updatedAt: number;
}

const STORAGE_KEY = "data-insights-chatbot:sessions";

/**
 * Load all sessions from localStorage.
 * Returns an empty array if there's nothing saved or the data is corrupt.
 */
export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    // Corrupt data — nuke it so we don't keep failing.
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Persist the full session list. Called after any create/update/delete.
 */
export function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Quota exceeded or storage blocked — silently ignore for now.
    // A future revision might surface a toast here.
  }
}

/**
 * Build a fresh Session from an upload result.
 */
export function createSession(
  result: UploadResponse,
  filename: string,
): Session {
  const now = Date.now();
  return {
    id: randomId(),
    filename,
    result,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a session to the front of the list and persist.
 */
export function addSession(sessions: Session[], session: Session): Session[] {
  const updated = [session, ...sessions];
  saveSessions(updated);
  return updated;
}

/**
 * Remove a session by id and persist.
 */
export function deleteSession(sessions: Session[], id: string): Session[] {
  const updated = sessions.filter((s) => s.id !== id);
  saveSessions(updated);
  return updated;
}

/**
 * Replace a session by id and persist.
 */
export function updateSession(
  sessions: Session[],
  id: string,
  patch: Partial<Session>,
): Session[] {
  const updated = sessions.map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s,
  );
  saveSessions(updated);
  return updated;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}
