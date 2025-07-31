
import { Hero } from "@/components/Hero";
import { VideoPreview } from "@/components/VideoPreview";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { UniqueFeatures } from "@/components/UniqueFeatures";
import { TargetAudience } from "@/components/TargetAudience";
import { Testimonials } from "@/components/Testimonials";
import AboutCalmon from "@/components/AboutCalmon";
import { CTA } from "@/components/CTA";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <VideoPreview />
      <Features />
      <Stats />
      <UniqueFeatures />
      <TargetAudience />
      <Testimonials />
      <AboutCalmon />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
