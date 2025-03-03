import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, Book, Sparkles, Mail, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../shared/Logo';
import { useAuth } from '../../state-management/AuthContext';
import { useNavigate } from 'react-router-dom';

// Add CSS for animations and full-screen background
const customStyles = `
  @keyframes float {
    0% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-10px) translateX(10px);
    }
    50% {
      transform: translateY(0) translateX(20px);
    }
    75% {
      transform: translateY(10px) translateX(10px);
    }
    100% {
      transform: translateY(0) translateX(0);
    }
  }
  
  @keyframes pulse-glow {
    0% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes text-shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-3000 {
    animation-delay: 3s;
  }
  
  .shimmer-effect {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 8s infinite;
  }
  
  .text-shimmer {
    background: linear-gradient(
      90deg, 
      #FFFFFF 0%, 
      #FFFFFF 40%, 
      #FFD700 50%, 
      #FFFFFF 60%, 
      #FFFFFF 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: text-shimmer 4s linear infinite;
    display: inline-block;
    font-weight: bold;
    color: transparent;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
  }
  
  /* Full-screen background styles */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  body > div {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .hero-container {
    width: 100vw !important;
    min-height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    background: linear-gradient(to right, #6C63FF, #8A6AFD, #9D4EDD) !important;
    position: relative !important;
    left: 0 !important;
    right: 0 !important;
    box-sizing: border-box !important;
  }
  
  /* Fix for any parent containers */
  #root, #__next, main, div[data-reactroot] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
`;

export function HeroSection() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  // Add the animation styles to the document head
  useEffect(() => {
    // Add the custom styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    // Fix any parent container margins
    const fixParentContainers = () => {
      const parents = [];
      let element = document.querySelector('.hero-container');
      
      if (element) {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          parents.push(parent);
          parent = parent.parentElement;
        }
        
        parents.forEach(p => {
          p.style.margin = '0';
          p.style.padding = '0';
          p.style.width = '100%';
          p.style.maxWidth = '100%';
          p.style.overflowX = 'hidden';
        });
      }
    };
    
    // Run immediately and after a short delay to ensure it applies
    fixParentContainers();
    setTimeout(fixParentContainers, 100);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      navigate('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      const pricingTitle = pricingSection.querySelector('.gradient-text');
      if (pricingTitle) {
        pricingTitle.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        // Add offset for the fixed header
        const offset = 100;
        const elementPosition = pricingTitle.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="hero-container" style={{
      position: 'absolute',
      left: 0,
      right: 0,
      width: '100vw',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: 'linear-gradient(to right, #6C63FF, #8A6AFD, #9D4EDD)'
    }}>
      {/* Full-width background gradient from right to left */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Glowing orbs in background */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-l from-[#6C63FF]/30 to-[#9D4EDD]/30 blur-3xl" 
             style={{animation: 'pulse-glow 8s infinite'}} />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#9D4EDD]/30 to-[#6C63FF]/30 blur-3xl" 
             style={{animation: 'pulse-glow 10s infinite'}} />
             
        {/* Animated flowing lines - horizontal across the screen */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M0,300 C250,350 750,250 1000,300" 
                  stroke="url(#gradient1)" strokeWidth="3" fill="none">
              <animate attributeName="d" 
                       dur="20s" 
                       repeatCount="indefinite" 
                       values="M0,300 C250,350 750,250 1000,300;
                               M0,300 C250,250 750,350 1000,300;
                               M0,300 C250,350 750,250 1000,300" />
            </path>
            <path d="M0,500 C250,450 750,550 1000,500" 
                  stroke="url(#gradient2)" strokeWidth="3" fill="none">
              <animate attributeName="d" 
                       dur="25s" 
                       repeatCount="indefinite" 
                       values="M0,500 C250,450 750,550 1000,500;
                               M0,500 C250,550 750,450 1000,500;
                               M0,500 C250,450 750,550 1000,500" />
            </path>
            <path d="M0,700 C250,750 750,650 1000,700" 
                  stroke="url(#gradient3)" strokeWidth="3" fill="none">
              <animate attributeName="d" 
                       dur="30s" 
                       repeatCount="indefinite" 
                       values="M0,700 C250,750 750,650 1000,700;
                               M0,700 C250,650 750,750 1000,700;
                               M0,700 C250,750 750,650 1000,700" />
            </path>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Animated light particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Transparent Navigation */}
      <nav className="relative z-10 bg-transparent w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-lg shadow-md">
              <Logo />
            </div>
            <div className="flex items-center gap-6">
              {/* Quick Links */}
              <div className="hidden md:flex items-center gap-8">
                <a 
                  href="#features" 
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  Features
                </a>
                <a 
                  href="#demo" 
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  Demo
                </a>
                <a 
                  href="#pricing" 
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  Pricing
                </a>
                <a 
                  href="#about" 
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  About
                </a>
                <button 
                  onClick={() => setIsSignInOpen(true)}
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={scrollToPricing}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                </button>
              </div>
              
              {/* Mobile menu button - only shown on small screens */}
              <div className="md:hidden flex items-center gap-4">
                <button 
                  onClick={() => setIsSignInOpen(true)}
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={scrollToPricing}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign In Modal */}
      <AnimatePresence>
        {isSignInOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setIsSignInOpen(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md mx-4 p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold gradient-text">Welcome Back</h2>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-500 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-xl hover:opacity-90 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignInOpen(false);
                      scrollToPricing();
                    }}
                    className="w-full text-sm text-gray-600 hover:text-[#4461F2] transition-colors duration-200"
                  >
                    Don't have an account? Sign Up
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full-screen Hero Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          {/* Centered Content */}
          <div className="w-full max-w-6xl mx-auto">
            {/* Headline with enhanced styling - single line for impact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-white" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}>
                <span className="text-shimmer">Journaling Reimagined:</span> <span className="block md:inline">Your Path to Emotional Clarity</span>
              </h1>
            </motion.div>
            
            {/* Subheadline with improved formatting - two lines for readability */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <p className="text-xl md:text-2xl text-[#F0F0F0] max-w-4xl mx-auto leading-relaxed" style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.1)' }}>
                Discover the power of AI-guided journaling<br />
                to understand your emotions and transform your inner world.
              </p>
            </motion.div>
            
            {/* Large, prominent CTA button with enhanced hover effects */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <button 
                onClick={scrollToPricing}
                className="group relative bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] text-white text-xl font-semibold px-12 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(255,107,53,0.5)] overflow-hidden"
                style={{
                  boxShadow: '0 15px 30px -10px rgba(255, 107, 53, 0.4)'
                }}
              >
                <span className="relative z-10 flex items-center">
                  Start Your Journey Today
                  <ArrowRight className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8F6B] to-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              {/* Smaller, less prominent security note with enhanced styling */}
              <div className="flex items-center gap-2 text-white/90 mt-6 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
            </motion.div>
          </div>
          
          {/* Floating Journal Icon with Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-16 right-10 md:right-20 lg:right-40 hidden md:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-150" 
                   style={{animation: 'pulse-glow 3s infinite'}} />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-5 shadow-lg">
                <Book className="w-14 h-14 text-[#6C63FF]" />
              </div>
              <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute -bottom-4 -left-4 w-10 h-10 text-[#FF6B35] animate-pulse animation-delay-2000" />
            </div>
          </motion.div>
          
          {/* Additional Floating Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute top-32 left-10 md:left-20 lg:left-40 hidden md:block"
          >
            <Sparkles className="w-12 h-12 text-white/70 animate-pulse" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="absolute top-1/2 left-1/4 hidden lg:block"
          >
            <Sparkles className="w-8 h-8 text-white/70 animate-pulse animation-delay-3000" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}