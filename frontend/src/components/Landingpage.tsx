import Navbar from "./navbar";
import Hero from "./hero";
import SearchBar from "./searchBar";
import Features from "./features";
import Forecast from "./forecast";
import Footer from "./footer";

type LandingPageProps = {
  onStart: () => void;
};

export default function LandingPage({
  onStart,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar onStart={onStart} />

      <main>
        <Hero onStart={onStart}  />

        <SearchBar />

        <Features />

        <Forecast />
      </main>

      <Footer />
    </div>
  );
}