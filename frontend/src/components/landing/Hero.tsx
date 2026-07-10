<section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#F7F4EE]">
  <div className="absolute -left-44 top-20 h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-[180px]" />
  <div className="absolute right-[-180px] top-0 h-[600px] w-[600px] rounded-full bg-indigo-400/10 blur-[220px]" />

  <nav className="relative flex items-center justify-between px-10 py-6">
    <span className="text-xl font-bold text-gray-900">Astrikos.AI</span>
    <div className="flex items-center gap-8 text-sm">
      <a href="#" className="font-medium text-gray-900 border-b-2 border-violet-500 pb-1">Platform</a>
      <a href="#" className="text-gray-500 hover:text-gray-900 transition">Solutions</a>
      <a href="#" className="text-gray-500 hover:text-gray-900 transition">Resources</a>
      <a href="#" className="text-gray-500 hover:text-gray-900 transition">Pricing</a>
    </div>
    <div className="flex items-center gap-4">
      <a href="#" className="text-sm text-gray-900">Sign In</a>
      <button className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
        Get Started
      </button>
    </div>
  </nav>

  <h1 className="... text-gray-900">
    ... <span className="text-violet-500">plain English.</span>
  </h1>

  <p className="mt-8 max-w-[520px] text-lg leading-8 text-gray-600">
    Upload CSV or Excel files, ask questions in natural language, and receive instant AI-powered insights, charts and forecasts.
  </p>

  <button
    onClick={onStart}
    className="rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:scale-105"
  >
    Get Started
  </button>
  <button className="rounded-xl border border-gray-200/60 px-8 py-3.5 text-sm font-medium text-gray-900 transition hover:border-violet-400">
    Sign In
  </button>

  <div className="relative h-[460px] w-[460px] rounded-[28px] border border-gray-200/60 bg-white p-7 shadow-sm">
    <span className="rounded-full border border-gray-200/60 bg-gray-50 px-3 py-1 text-[10px] tracking-wide text-gray-500">
      LIVE DASHBOARD
    </span>

    <div className="flex-1 rounded-2xl border border-gray-200/60 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">Revenue</p>
      <h2 className="mt-1 text-3xl font-bold text-gray-900">$1.2M</h2>
    </div>

    <div className="mt-6 flex items-start gap-2.5 border-t border-gray-200/60 pt-4">
      <div className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-violet-500" />
      <p className="text-xs leading-relaxed">
        <span className="font-bold text-gray-900">Processing Query... </span>
        <span className="text-gray-500">"What was the conversion rate trend last quarter?"</span>
      </p>
    </div>
  </div>
</section>