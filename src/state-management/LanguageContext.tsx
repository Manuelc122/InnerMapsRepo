import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Define a type for the translations
type TranslationDictionary = Record<string, string>;

const translations: Record<Language, TranslationDictionary> = {
  en: {
    'hero.title': 'Journaling Reimagined: Your Path to Emotional Clarity',
    'hero.subtitle': 'Discover the power of AI-guided journaling to understand your emotions, track your growth, and transform your inner world.',
    'hero.cta': 'Start Your Journey Today',
    'hero.trust': 'Secure & Private',
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
    'hero.title': 'Diario Reimaginado: Tu Camino a la Claridad Emocional',
    'hero.subtitle': 'Descubre el poder del diario guiado por IA para entender tus emociones, seguir tu crecimiento y transformar tu mundo interior.',
    'hero.cta': 'Comienza Tu Viaje Hoy',
    'hero.trust': 'Seguro y Privado',
    'showcase.title': 'Experimenta Tu Viaje de Crecimiento Personal',
    'showcase.subtitle': 'Descubre cómo InnerMaps transforma tus reflexiones diarias',
    'showcase.trust': '🔒 Seguridad bancaria • GDPR • 99.9% Disponibilidad',
    'showcase.journal.title': 'Escribe Libremente, Obtén Insights al Instante',
    'showcase.journal.subtitle': 'Nuestra IA te guía en tu viaje de autodescubrimiento',
    'showcase.journal.feature1.title': 'Prompts Inteligentes',
    'showcase.journal.feature1.description': 'Prompts generados por IA que inspiran reflexión profunda',
    'showcase.journal.feature2.title': 'Análisis en Tiempo Real',
    'showcase.journal.feature2.description': 'Obtén insights instantáneos mientras escribes',
    'showcase.journal.feature3.title': 'Seguimiento Emocional',
    'showcase.journal.feature3.description': 'Monitorea tu bienestar emocional a lo largo del tiempo',
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Elige el plan que mejor funcione para tu viaje de autodescubrimiento',
    'pricing.monthly.description': 'Perfecto para comenzar',
    'pricing.yearly.description': 'Ahorra 17% con facturación anual',
    'pricing.feature.entries': 'Entradas de diario ilimitadas',
    'pricing.feature.insights': 'Insights potenciados por IA',
    'pricing.feature.tracking': 'Seguimiento de progreso',
    'pricing.feature.support': 'Soporte prioritario',
    'pricing.feature.early_access': 'Acceso anticipado a nuevas funciones',
    'pricing.cta.monthly': 'Comenzar Mensual',
    'pricing.cta.yearly': 'Comenzar Anual',
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