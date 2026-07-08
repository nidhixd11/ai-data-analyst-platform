export default function Features() {
  return (
    <section className="mx-auto mt-32 max-w-6xl px-8">
      <h2 className="mb-12 text-center text-5xl font-bold text-white">
        Built for clarity.
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <div className="rounded-3xl border border-[#2a2a35] bg-[#17171f] p-8 shadow-lg transition-all hover:border-violet-500">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-900">
            📄
          </div>

          <h3 className="text-2xl font-bold text-white">
            Upload any file
          </h3>

          <p className="mt-4 text-gray-400">
            CSV, JSON, Excel, or direct database connections.
            We automatically detect and format your data.
          </p>

          <div className="mt-8 h-24 rounded-xl bg-gradient-to-r from-[#1d1d27] to-[#232335]"></div>
        </div>

        {/* Visualization Card */}
        <div className="rounded-3xl border border-[#2a2a35] bg-[#17171f] p-8 shadow-lg transition-all hover:border-violet-500">
          <h3 className="text-5xl font-bold leading-tight text-white">
            Instant
            <br />
            <span className="text-violet-400">
              Visualizations
            </span>
          </h3>

          <p className="mt-4 text-gray-400">
            Generate charts, graphs and dashboards with a
            single prompt.
          </p>

          <div className="mt-8 flex justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400"></div>
            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-3xl border border-[#2a2a35] bg-[#17171f] p-8 shadow-lg transition-all hover:border-violet-500">
          <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-white">
            BEST FEATURE
          </span>

          <h3 className="mt-6 text-2xl font-bold text-white">
            AI-Powered Insights
          </h3>

          <p className="mt-4 text-gray-400">
            Explain trends, detect anomalies and receive
            predictive insights from your data.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-violet-500">
              ⚡
            </div>
          </div>
        </div>

        {/* Team Card */}
        <div className="rounded-3xl border border-[#2a2a35] bg-[#17171f] p-8 shadow-lg transition-all hover:border-violet-500">
          <h3 className="text-2xl font-bold text-white">
            Team Collaboration
          </h3>

          <p className="mt-4 text-gray-400">
            Share dashboards, comments and insights with
            your teammates.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-[#23232d] p-4">
              <p className="font-semibold text-white">
                👩 Sarah Jenkins
              </p>

              <p className="text-sm text-gray-400">
                Data Analyst
              </p>
            </div>

            <div className="rounded-xl bg-[#23232d] p-4">
              <p className="font-semibold text-white">
                👨 David Chen
              </p>

              <p className="text-sm text-gray-400">
                Senior ML Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}