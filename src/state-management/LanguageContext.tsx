import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'hero.title': 'The AI Journal That Reads Between Your Lines',
    'hero.subtitle': '5 minutes of daily journaling → Lifetime of personal insights',
    'hero.cta': 'Start Your Free Journey',
    'hero.trust': 'Trusted by psychologists, life coaches, and 10,000+ growth seekers',
    'showcase.title': 'Experience Your Personal Growth Journey',
    'showcase.subtitle': 'See how InnerMaps transforms your daily reflections into meaningful insights',
    'showcase.trust': '🔒 Bank-grade security • GDPR Compliant • 99.9% Uptime',
    'showcase.journal.title': 'Write Freely, Gain Insights Instantly',
    'showcase.journal.subtitle': 'Our AI companion guides your self-discovery journey',
    'showcase.journal.feature1.title': 'Smart Prompts',
    'showcase.journal.feature1.description': 'AI-generated prompts that inspire deeper reflection',
    'showcase.journal.feature2.title': 'Real-time Analysis',
    'showcase.journal.feature2.description': 'Get instant insights as you write',
    'showcase.journal.feature3.title': 'Emotional Tracking',
    'showcase.journal.feature3.description': 'Monitor your emotional well-being over time',
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose the plan that works best for your journey of self-discovery',
    'pricing.monthly.description': 'Perfect for getting started',
    'pricing.yearly.description': 'Save 17% with annual billing',
    'pricing.feature.entries': 'Unlimited journal entries',
    'pricing.feature.insights': 'AI-powered insights',
    'pricing.feature.tracking': 'Progress tracking',
    'pricing.feature.support': 'Priority support',
    'pricing.feature.early_access': 'Early access to new features',
    'pricing.cta.monthly': 'Get Started Monthly',
    'pricing.cta.yearly': 'Get Started Yearly',
    'pricing.badge': 'BEST VALUE'
  },
  es: {
    'hero.title': 'El Diario con IA que Lee Entre Líneas',
    'hero.subtitle': '5 minutos de escritura diaria → Una vida de insights personales',
    'hero.cta': 'Comienza Tu Viaje Gratis',
    'hero.trust': 'Confiado por psicólogos, coaches y más de 10,000 personas',
    'showcase.title': 'Experimenta Tu Viaje de Crecimiento Personal',
    'showcase.subtitle': 'Descubre cómo InnerMaps transforma tus reflexiones diarias',
    'showcase.trust': '🔒 Seguridad bancaria • GDPR • 99.9% Disponibilidad',
    'showcase.journal.title': 'Escribe Libremente, Obtén Insights al Instante',
    'showcase.journal.subtitle': 'Nuestra IA te guía en tu viaje de autodescubrimiento',
    'showcase.journal.feature1.title': 'Sugerencias Inteligentes',
    'showcase.journal.feature1.description': 'Prompts generados por IA para reflexión profunda',
    'showcase.journal.feature2.title': 'Análisis en Tiempo Real',
    'showcase.journal.feature2.description': 'Obtén insights mientras escribes',
    'showcase.journal.feature3.title': 'Seguimiento Emocional',
    'showcase.journal.feature3.description': 'Monitorea tu bienestar emocional',
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Elige el plan que mejor se adapte a tu viaje',
    'pricing.monthly.description': 'Perfecto para comenzar',
    'pricing.yearly.description': 'Ahorra 17% con facturación anual',
    'pricing.feature.entries': 'Entradas ilimitadas',
    'pricing.feature.insights': 'Insights potenciados por IA',
    'pricing.feature.tracking': 'Seguimiento de progreso',
    'pricing.feature.support': 'Soporte prioritario',
    'pricing.feature.early_access': 'Acceso anticipado a nuevas funciones',
    'pricing.cta.monthly': 'Comenzar Plan Mensual',
    'pricing.cta.yearly': 'Comenzar Plan Anual',
    'pricing.badge': 'MEJOR VALOR'
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}