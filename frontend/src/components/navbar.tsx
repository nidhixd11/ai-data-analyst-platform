type NavbarProps = {
  onStart: () => void;
};

export default function Navbar({ onStart }: NavbarProps) {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
      <div className="flex items-center gap-10">
        <h1 className="text-xl font-bold">
          Lumen
        </h1>

        <div className="hidden gap-8 text-sm text-gray-400 md:flex">
          <a href="#">Features</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Pricing</a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-300">
          Log in
        </button>

        <button
          onClick={onStart}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold hover:bg-violet-500"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}