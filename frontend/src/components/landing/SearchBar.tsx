import { useState } from "react";
import { Plus, Mic, ArrowRight, Sparkles, ChevronDown } from "lucide-react";

const MODELS = ["Ollama", "Groq", "Gemini AI"];

export default function SearchBar() {
  const [selectedModel, setSelectedModel] = useState("Ollama");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="search-bar" className="bg-[#0d0e12] pb-24 pt-2">
      <div className="mx-auto max-w-2xl px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#14141a] px-4 py-3 shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)]">
          <input
            type="text"
            placeholder="Ask anything about your data..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
            <button className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white">
              Normal
            </button>

            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {selectedModel.toUpperCase()}
                <ChevronDown className="h-3 w-3" />
              </button>

              {isOpen && (
                <div className="absolute bottom-full left-0 z-10 mb-2 w-32 overflow-hidden rounded-lg border border-white/10 bg-[#14141a] shadow-lg">
                  {MODELS.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 transition hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 transition hover:text-white">
              <Mic className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90">
              Send
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}