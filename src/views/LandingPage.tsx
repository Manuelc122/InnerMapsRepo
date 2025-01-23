import React from 'react';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeaturesSection } from '../components/Landing/FeaturesSection';
import { DemoSection } from '../components/Landing/DemoSection';
import { PricingSection } from '../components/Pricing/PricingSection';
import { AboutSection } from '../components/Landing/AboutSection';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { Footer } from '../components/Landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HeroSection />
      
      <FeaturesSection />
      
      <section id="demo" className="py-24 bg-white">
        <DemoSection />
      </section>
      
      <section id="pricing" className="py-24">
        <PricingSection />
      </section>
      
      <section id="about" className="py-24 bg-white">
        <AboutSection />
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
} 