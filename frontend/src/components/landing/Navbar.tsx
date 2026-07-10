import { useState } from "react";

type NavbarProps = {
  onStart: () => void;
};

const navItems = [
  "Platform",
  "Solutions",
  "Resources",
  "Pricing",
];

export default function Navbar({ onStart }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-[#0B0B10]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <a
          href="/"
          className="select-none text-[24px] font-medium tracking-[-0.03em] text-[#C4B5FD]"
        >
          Astrikos.AI
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`relative pb-1 text-[15px] font-medium transition-colors duration-300 ${
                index === 0
                  ? "text-[#C4B5FD]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item}

              {index === 0 && (
                <span className="absolute -bottom-[8px] left-0 h-[2px] w-full rounded-full bg-[#A78BFA]" />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-6 lg:flex">
          <button className="text-[15px] font-medium text-gray-300 transition hover:text-white">
            Sign In
          </button>

          <button
            onClick={onStart}
            className="rounded-full bg-[#A78BFA] px-7 py-3 text-[15px] font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-[#C4B5FD]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-3xl text-white lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0B0B10] lg:hidden">
          <div className="flex flex-col gap-5 px-6 py-6">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-left text-gray-300 transition hover:text-white"
              >
                {item}
              </button>
            ))}

            <button className="text-left text-gray-300 hover:text-white">
              Sign In
            </button>

            <button
              onClick={onStart}
              className="mt-2 rounded-full bg-[#A78BFA] py-3 font-semibold text-black"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}