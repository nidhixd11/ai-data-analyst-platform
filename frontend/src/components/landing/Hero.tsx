interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0d0e12]">
      <div className="absolute -left-44 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[180px]" />
      <div className="absolute right-[-180px] top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[220px]" />

      <div className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-16 px-10 pt-16 pb-24">
        {/* Left */}
        <div className="max-w-[640px]">
          <h1 className="text-[76px] font-black leading-[0.95] tracking-[-0.03em] text-white">
            The analytics
            <br />
            platform that
            <br />
            understands
            <br />
            <span className="text-[#C4B5FD]">plain English.</span>
          </h1>

          <p className="mt-8 max-w-[520px] text-lg leading-8 text-gray-400">
            Upload CSV or Excel files, ask questions in natural language,
            and receive instant AI-powered insights, charts and forecasts.
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={onStart}
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:scale-105"
            >
              Get Started
            </button>

            <button className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-white transition hover:border-violet-500">
              Sign In
            </button>
          </div>
        </div>

        {/* Right Card */}
        <div className="relative">
          <div className="absolute inset-0 rounded-[40px] bg-violet-500/20 blur-[100px]" />

          <div className="relative h-[460px] w-[460px] rounded-[28px] border border-white/10 bg-[#14141a] p-7 shadow-[0_30px_80px_rgba(139,92,246,0.25)]">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-violet-400/70" />
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] tracking-wide text-gray-400">
                LIVE DASHBOARD
              </span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs text-gray-500">Revenue</p>
                <h2 className="mt-1 text-3xl font-bold text-white">$1.2M</h2>
                <p className="mt-1 text-xs text-green-400">+12.4%</p>
              </div>

              <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs text-gray-500">Active Users</p>
                <h2 className="mt-1 text-3xl font-bold text-white">48.2k</h2>
                <p className="mt-1 text-xs text-red-400">-2.1%</p>
              </div>
            </div>

            <div className="mt-7 flex h-[150px] items-end justify-between gap-2.5">
              {[35, 55, 42, 78, 100, 72, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-700/60 to-[#C4B5FD]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2.5 border-t border-white/5 pt-4">
              <div className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />

              <p className="text-xs leading-relaxed">
                <span className="font-bold text-white">
                  Processing Query...
                </span>{" "}
                <span className="text-gray-400">
                  "What was the conversion rate trend last quarter?"
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}