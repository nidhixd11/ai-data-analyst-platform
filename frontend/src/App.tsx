import { useState } from "react";
import Layout from "./components/Layout";
import RightRail from "./components/RightRail";
import UploadZone from "./features/upload/UploadZone";
import SuggestionPills from "./features/upload/SuggestionPills";
import Dashboard from "./features/dashboard/Dashboard";
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
    // Stub for now — T-134 will wire this to the chat composer.
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
        <Dashboard
          result={snapshot.result}
          filename={snapshot.filename}
          onReset={handleReset}
        />
      )}
    </Layout>
  );
}

export default App;
