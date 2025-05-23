
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedTournaments from "@/components/FeaturedTournaments";
import GamesSection from "@/components/GamesSection";
import FeatureSection from "@/components/FeatureSection";
import JoinCTA from "@/components/JoinCTA";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedTournaments />
        <GamesSection />
        <FeatureSection />
        <JoinCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
