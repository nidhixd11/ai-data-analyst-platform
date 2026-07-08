type HeroProps = {
  onStart: () => void;
};

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-16 px-8 py-20 lg:flex-row">
      {/* LEFT */}
      <div className="max-w-xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
          AI Analytics Platform
        </p>

        <h1 className="text-6xl font-black leading-tight text-white">
          The analytics
          <br />
          platform that
          <br />
          understands
          <span className="text-violet-400"> plain English.</span>
        </h1>

        <p className="mt-8 text-lg leading-8 text-gray-400">
          Upload CSV or Excel files, ask questions in natural language,
          and receive instant AI-powered insights, charts and forecasts.
        </p>

        <div className="mt-10 flex gap-4">
          <button
            onClick={onStart}
            className="rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white transition hover:bg-violet-500"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="relative">
        <div className="w-[430px] rounded-3xl border border-[#2a2a35] bg-[#17171f] p-8 shadow-2xl">

          <div className="mb-8 flex justify-between">
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <h2 className="text-3xl font-bold text-white">$2.1M</h2>
            </div>

            <div>
              <p className="text-sm text-gray-400">Growth</p>
              <h2 className="text-3xl font-bold text-violet-400">
                +45.2%
              </h2>
            </div>
          </div>

          {/* Graph */}

          <div className="flex h-60 items-end justify-between gap-3">
            <div className="h-20 w-10 rounded bg-violet-900"></div>
            <div className="h-32 w-10 rounded bg-violet-700"></div>
            <div className="h-24 w-10 rounded bg-violet-600"></div>
            <div className="h-44 w-10 rounded bg-violet-400"></div>
            <div className="h-36 w-10 rounded bg-violet-500"></div>
            <div className="h-48 w-10 rounded bg-violet-300"></div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Live analytics powered by AI
          </p>
        </div>

        {/* Floating Card */}

        <div className="absolute -right-5 -top-5 rounded-2xl border border-[#2a2a35] bg-[#222230] px-5 py-4 shadow-xl">
          <p className="text-xs text-gray-400">
            Accuracy
          </p>

          <h3 className="text-2xl font-bold text-white">
            98%
          </h3>
        </div>
      </div>
    </section>
  );
}