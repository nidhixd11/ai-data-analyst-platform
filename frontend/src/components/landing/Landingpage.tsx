import Navbar from "./Navbar";
import Hero from "./Hero";
import SearchBar from "./SearchBar";
import Features from "./Features";
import Forecast from "./Forecast";
import Footer from "./Footer";

export default function LandingPage() {
  const handleStart = () => {
    // handle start action here
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar  onStart={handleStart} />
      <Hero onStart={handleStart}/>
      <SearchBar />
      <Features />
      <Forecast />
      <Footer />
    </div>
  );
}