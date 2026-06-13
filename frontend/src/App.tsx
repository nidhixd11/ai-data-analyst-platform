import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import RightRail from "./components/RightRail";
import UploadZone from "./features/upload/UploadZone";
import SuggestionPills from "./features/upload/SuggestionPills";
import Dashboard from "./features/dashboard/Dashboard";
import ChatPanel from "./features/chat/ChatPanel";
import SessionsSidebar from "./features/sessions/SessionsSidebar";
import {
  loadSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createSession,
  addSession,
  deleteSession,
  updateSession,
  type Session,
} from "./features/sessions/sessionStorage";
import type { UploadResponse } from "./features/upload/mockApi";
import type { ChatMessage } from "./features/chat/mockChat";

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(
    null,
  );
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(
    undefined,
  );

  // Load saved sessions + last active session on first mount.
  useEffect(() => {
    const stored = loadSessions();
    setSessions(stored);
    const lastActive = loadActiveSessionId();
    // Only restore if the id still exists in the stored list.
    if (lastActive && stored.some((s) => s.id === lastActive)) {
      setActiveSessionIdState(lastActive);
    }
  }, []);

  /** Wrapped setter that also persists the active id. */
  function setActiveSession(id: string | null) {
    setActiveSessionIdState(id);
    saveActiveSessionId(id);
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  function handleUploadComplete(result: UploadResponse, file: File) {
    const session = createSession(result, file.name);
    setSessions((prev) => addSession(prev, session));
    setActiveSession(session.id);
  }

  function handleNewSession() {
    setActiveSession(null);
    setPendingPrompt(undefined);
  }

  function handleSelectSession(id: string) {
    setActiveSession(id);
    setPendingPrompt(undefined);
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => deleteSession(prev, id));
    if (activeSessionId === id) {
      setActiveSession(null);
    }
  }

  function handleSuggestionPick(prompt: string) {
    setPendingPrompt(prompt);
  }

  /** Persist chat messages for the active session. */
  function handleMessagesChange(messages: ChatMessage[]) {
    if (!activeSessionId) return;
    setSessions((prev) => updateSession(prev, activeSessionId, { messages }));
  }

  return (
    <Layout
      leftSidebar={
        <SessionsSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewSession={handleNewSession}
        />
      }
      rightRail={<RightRail hasActiveData={activeSession !== null} />}
    >
      {activeSession === null ? (
        <div className="flex h-full flex-col items-center justify-center gap-10 py-12">
          <UploadZone onUploadComplete={handleUploadComplete} />
          <SuggestionPills disabled onPick={handleSuggestionPick} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
          <Dashboard
            result={activeSession.result}
            filename={activeSession.filename}
            onReset={handleNewSession}
          />
          <SuggestionPills disabled={false} onPick={handleSuggestionPick} />
          <ChatPanel
            // Keying by session id resets local chat input/state when switching.
            key={activeSession.id}
            initialPrompt={pendingPrompt}
            onInitialPromptConsumed={() => setPendingPrompt(undefined)}
            messages={activeSession.messages}
            onMessagesChange={handleMessagesChange}
          />
        </div>
      )}
    </Layout>
  );
}

export default App;
