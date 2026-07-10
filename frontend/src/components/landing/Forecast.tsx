export default function Forecast() {
  return (
    <section className="max-w-5xl mx-auto px-4 mt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left copy */}
        <div>
          <p className="text-xs tracking-widest text-purple-400 font-medium mb-3">
            NEXT-GEN ANALYTICS
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Predictive Forecasting
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            Anticipate market shifts before they happen. Astrikos.AI's predictive engine uses historical patterns to project future performance with over 94% accuracy.
          </p>
          <span className="inline-flex items-center gap-2 text-xs text-purple-300 border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            LIVE TRAINING
          </span>
        </div>

        {/* Right chart card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Projected Growth</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">$4.82M</span>
                <span className="text-xs text-emerald-400">+28%</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">Next 12 Months</span>
          </div>

          <svg viewBox="0 0 400 140" className="w-full h-32">
            <defs>
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 C40,90 60,110 90,70 C120,30 150,20 180,50 C210,80 230,110 260,90 C290,70 310,30 340,25 C360,22 380,35 400,30"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2.5"
            />
            <path
              d="M0,100 C40,90 60,110 90,70 C120,30 150,20 180,50 C210,80 230,110 260,90 C290,70 310,30 340,25 C360,22 380,35 400,30 L400,140 L0,140 Z"
              fill="url(#forecastFill)"
            />
          </svg>

          <div className="border-t border-white/10 mt-4 pt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-[11px] text-gray-500">Model updated 4 mins ago</span>
          </div>
        </div>
      </div>
    </section>
  );
}