import { useState } from "react";
import Layout from "./components/Layout";
import RightRail from "./components/RightRail";
import UploadZone from "./features/upload/UploadZone";
import SuggestionPills from "./features/upload/SuggestionPills";
import type { UploadResponse } from "./features/upload/mockApi";

function App() {
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  function handleSuggestionPick(prompt: string) {
    // Stub for now — T-134 will wire this to the chat composer.
    console.log("Suggestion picked:", prompt);
  }

  return (
    <Layout rightRail={<RightRail hasActiveData={uploadResult !== null} />}>
      <div className="flex h-full flex-col items-center justify-center gap-10 py-12">
        <UploadZone onUploadComplete={setUploadResult} />
        <SuggestionPills
          disabled={uploadResult === null}
          onPick={handleSuggestionPick}
        />
      </div>
    </Layout>
  );
}

export default App;
