import { useState } from "react";
import Layout from "./components/Layout";
import RightRail from "./components/RightRail";
import UploadZone from "./features/upload/UploadZone";
import SuggestionPills from "./features/upload/SuggestionPills";
import Dashboard from "./features/dashboard/Dashboard";
import ChatPanel from "./features/chat/ChatPanel";
import type { UploadResponse } from "./features/upload/mockApi";

interface UploadSnapshot {
  result: UploadResponse;
  filename: string;
}

function App() {
  const [snapshot, setSnapshot] = useState<UploadSnapshot | null>(null);

  function handleUploadComplete(result: UploadResponse, file: File) {
    setSnapshot({ result, filename: file.name });
  }

  function handleReset() {
    setSnapshot(null);
  }

  function handleSuggestionPick(prompt: string) {
    console.log("Suggestion picked:", prompt);
  }

  return (
    <Layout rightRail={<RightRail hasActiveData={snapshot !== null} />}>
      {snapshot === null ? (
        <div className="flex h-full flex-col items-center justify-center gap-10 py-12">
          <UploadZone onUploadComplete={handleUploadComplete} />
          <SuggestionPills disabled onPick={handleSuggestionPick} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
          <Dashboard
            result={snapshot.result}
            filename={snapshot.filename}
            onReset={handleReset}
          />
          <ChatPanel />
        </div>
      )}
    </Layout>
  );
}

export default App;
