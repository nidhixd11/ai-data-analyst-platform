import { FileText, Zap } from "lucide-react";

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-4 mt-32">
      <div className="text-center mb-12">
        <p className="text-xs tracking-widest text-purple-400 font-medium mb-2">
          CORE INTELLIGENCE
        </p>
        <h2 className="text-3xl font-bold text-white">Built for clarity.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload any file */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 min-h-[220px] flex flex-col">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Upload any file</h3>
          <p className="text-sm text-gray-400">
            CSV, JSON, Excel, or direct DB connections. We handle the formatting.
          </p>
        </div>

        {/* Instant Visualizations */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 min-h-[220px] flex flex-col justify-end">
          <h3 className="text-2xl font-semibold text-white leading-tight">
            Instant{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Visualizations
            </span>
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Type a prompt, get a chart. Zero configuration required for beautiful reporting.
          </p>
        </div>

        {/* AI-Powered Insights */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 min-h-[220px] flex flex-col relative overflow-hidden">
          <span className="text-[10px] tracking-wide bg-white/10 text-gray-300 px-2 py-0.5 rounded-full w-fit mb-4">
            DEEP ENGINE
          </span>
          <h3 className="text-white font-semibold text-lg mb-1">AI-Powered Insights</h3>
          <p className="text-sm text-gray-400 mb-6">
            It doesn't just show data; it explains the "why" behind the numbers, spotting trends before they become problems.
          </p>
          <div className="mt-auto flex justify-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Team Collaboration */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 min-h-[220px] flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-4">Team Collaboration</h3>
          <p className="text-sm text-gray-400 mb-4">
            Share dashboards, annotate charts, and tag teammates. Data science is now a team sport.
          </p>
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500" />
              <div className="text-xs">
                <p className="text-white font-medium leading-tight">Sarah Jenkins</p>
                <p className="text-gray-500 leading-tight">Commented on "Revenue Growth"</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
              <div className="text-xs">
                <p className="text-white font-medium leading-tight">David Chen</p>
                <p className="text-gray-500 leading-tight">Shared a new exploration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}