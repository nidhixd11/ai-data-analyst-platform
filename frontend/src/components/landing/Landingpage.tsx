import Hero from "./Hero";
import Features from "./Features";
import Forecast from "./Forecast";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white">
      <Navbar onStart={onStart} />
      <Hero onStart={onStart} />
      <Features />
      <Forecast />
      <Footer />
    </div>
  );
}
