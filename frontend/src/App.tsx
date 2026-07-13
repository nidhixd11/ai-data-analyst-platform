import { useState } from "react";
import Layout from "./components/Layout";
import RightRail from "./components/RightRail";
import LandingPage from "./components/landing/Landingpage";
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
  const [showLanding, setShowLanding] = useState(true);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(undefined);
  const [rightRailOpen, setRightRailOpen] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(() => {
    const stored = loadSessions();
    const lastActive = loadActiveSessionId();
    return lastActive && stored.some((s) => s.id === lastActive) ? lastActive : null;
  });

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

  function handleMessagesChange(messages: ChatMessage[]) {
    if (!activeSessionId) return;
    setSessions((prev) => updateSession(prev, activeSessionId, { messages }));
  }

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
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
          onGoHome={() => setShowLanding(true)}
        />
      }
      rightRail={
        <RightRail
          hasActiveData={activeSession !== null}
          result={activeSession?.result}
          sessions={sessions}
          onSelectSession={handleSelectSession}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      }
      rightRailOpen={rightRailOpen}
      onToggleRightRail={() => setRightRailOpen((v) => !v)}
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
            currency={currency}
            onCurrencyChange={setCurrency}
          />
          <SuggestionPills disabled={false} onPick={handleSuggestionPick} />
          <ChatPanel
            key={activeSession.id}
            sessionId={activeSession.result.session_id}
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
