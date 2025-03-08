import React from 'react';
import { HeroSection } from '../components/marketing/HeroSection';
import { FeaturesSection } from '../components/marketing/FeaturesSection';
import { DemoSection } from '../components/marketing/DemoSection';
import { PricingSection } from '../components/subscription/PricingSection';
import { FAQSection } from '../components/marketing/FAQSection';
import { AboutSection } from '../components/marketing/AboutSection';
import { ScrollToTop } from '../components/shared/ScrollToTop';
import { Footer } from '../components/marketing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C63FF]/10 via-[#8A6AFD]/5 to-white">
      <div className="mx-auto max-w-[1440px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          
          <FeaturesSection />
          
          <section id="demo" className="py-24 bg-white/80 backdrop-blur-sm">
            <DemoSection />
          </section>
          
          <section id="pricing" className="py-24">
            <PricingSection />
          </section>
          
          <section id="faq" className="py-24 bg-white/80 backdrop-blur-sm">
            <FAQSection />
          </section>
          
          <section id="about" className="py-24">
            <AboutSection />
          </section>

          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </div>
  );
} 