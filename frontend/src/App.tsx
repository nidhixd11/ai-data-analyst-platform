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
  createSession,
  addSession,
  deleteSession,
  type Session,
} from "./features/sessions/sessionStorage";
import type { UploadResponse } from "./features/upload/mockApi";

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(
    undefined,
  );

  // Load saved sessions on first mount.
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  function handleUploadComplete(result: UploadResponse, file: File) {
    const session = createSession(result, file.name);
    setSessions((prev) => addSession(prev, session));
    setActiveSessionId(session.id);
  }

  function handleNewSession() {
    setActiveSessionId(null);
    setPendingPrompt(undefined);
  }

  function handleSelectSession(id: string) {
    // Part B will restore the full session state.
    // For now, just mark it active so the sidebar reflects the click.
    setActiveSessionId(id);
    setPendingPrompt(undefined);
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => deleteSession(prev, id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  }

  function handleSuggestionPick(prompt: string) {
    setPendingPrompt(prompt);
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
            initialPrompt={pendingPrompt}
            onInitialPromptConsumed={() => setPendingPrompt(undefined)}
          />
        </div>
      )}
    </Layout>
  );
}

export default App;
