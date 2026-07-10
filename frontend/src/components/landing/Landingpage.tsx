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
    <>
      <Navbar onStart={onStart} />
      <Hero onStart={onStart} />
      <Features />
      <Forecast />
      <Footer />
    </>
  );
}
