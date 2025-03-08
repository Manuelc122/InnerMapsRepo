import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, X, Filter, MessageCircle, Zap, Brain, Heart, Sparkles, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
  tagline: string;
  isOpen: boolean;
  toggleOpen: () => void;
  index: number;
  category: string;
}

// Define categories and their icons
const categories = [
  { id: 'all', name: 'All Questions', icon: MessageCircle },
  { id: 'basics', name: 'Basics', icon: Zap },
  { id: 'features', name: 'Features', icon: Brain },
  { id: 'experience', name: 'Experience', icon: Heart },
  { id: 'technical', name: 'Technical', icon: Sparkles },
];

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, tagline, isOpen, toggleOpen, index, category }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Scroll into view when opened
  useEffect(() => {
    if (isOpen && itemRef.current) {
      const yOffset = -100; // Offset to account for sticky header
      const y = itemRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, [isOpen]);

  return (
    <motion.div 
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`border-b border-gray-200 last:border-b-0 transition-all duration-300 ${
        isOpen ? 'bg-white/95 backdrop-blur-md rounded-xl my-4 shadow-lg' : 'hover:bg-white/60 hover:backdrop-blur-sm rounded-xl'
      }`}
      data-category={category}
    >
      <button
        onClick={toggleOpen}
        className="flex justify-between items-start w-full py-6 px-8 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 rounded-xl group"
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <h3 className={`text-xl font-semibold tracking-tight ${
            isOpen 
              ? 'text-[#8A6AFD]' 
              : 'text-[#6C63FF] group-hover:text-[#8A6AFD]'
          } transition-all duration-300`}>
            {question}
          </h3>
          <AnimatePresence>
            {isOpen && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-gray-600 font-medium mt-3 text-lg leading-relaxed"
              >
                {tagline}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <span className={`ml-6 flex-shrink-0 p-2 rounded-full ${
          isOpen 
            ? 'bg-[#6C63FF]/10 text-[#8A6AFD] shadow-sm' 
            : 'text-gray-500 group-hover:bg-gray-100'
        } transition-all duration-300 transform ${isOpen ? 'rotate-0' : 'rotate-0'}`}>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-8 px-8 pr-16">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-gray-600 text-lg leading-relaxed font-normal"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredFaqs, setFilteredFaqs] = useState<any[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const faqs = [
    {
      question: "What exactly is InnerMaps?",
      tagline: "Your 24/7 emotional detective and confidant.",
      answer: "InnerMaps isn't just an app—it's the first AI journal that learns you. Imagine a genius therapist who never sleeps, obsessively studies your thoughts, and whispers life-changing insights: \"You're noticeably happier on days you skip social media\" or \"Your creativity peaks when you journal at sunrise.\" This is self-discovery, weaponized.",
      category: "basics"
    },
    {
      question: "How does the AI-enhanced journaling work?",
      tagline: "It's like your mind's personal biographer.",
      answer: "Every word you write gets dissected by our psychologist-trained AI. It doesn't just read—it hunts for hidden emotional blueprints. Wrote about stress last Tuesday? It'll link it to today's anxiety spike and say: \"Let's fix this pattern before it ruins your weekend.\" You're not writing a diary—you're coding your emotional operating system.",
      category: "features"
    },
    {
      question: "What makes InnerMaps different from a regular journal app?",
      tagline: "Other apps collect dust. InnerMaps collects breakthroughs.",
      answer: "While basic journals just sit there, our AI attacks your entries like a PhD researcher obsessed with your growth. It cross-references your darkest nights and brightest days to hand you cheat codes like: \"When you feel stuck, revisit Memory #42 – that's where you cracked this last time.\"",
      category: "basics"
    },
    {
      question: "Do I need to journal every day for InnerMaps to be effective?",
      tagline: "We work as hard as you do—maybe harder.",
      answer: "Skip a week? InnerMaps digs deeper into what you did share. Journal once a month? It'll ambush you with revelations like: \"Your 3 entries this year all point to one career change you're avoiding.\" This isn't homework—it's a mind-hack that meets you where you are.",
      category: "experience"
    },
    {
      question: "What is the Coach Chat feature and how does it help me?",
      tagline: "Your genius best friend who never gets tired of your problems.",
      answer: "Coach Chat doesn't just \"respond\"—it evolves. Vent about your breakup at 2 AM, and six months later, when you mention dating again, it'll remind you: \"Last time, you said you wanted someone who…\" This isn't AI—it's the mentor you wish you had.",
      category: "features"
    },
    {
      question: "How does the Memory Manager enhance my journaling experience?",
      tagline: "Your brain's personal Wikipedia for emotional breakthroughs.",
      answer: "While you sleep, InnerMaps builds a vault of your most explosive insights. That throwaway thought about quitting your job? The AI tags it as Memory #87: Career Crossroads and waits to slam it back on your screen when you mention burnout again. Your past self becomes your wisest coach.",
      category: "features"
    },
    {
      question: "Can I use voice recording instead of typing my entries?",
      tagline: "Turn raw emotion into cold, hard clarity.",
      answer: "Rant into your phone after a fight. Cry in your car. Whisper hopes at 3 AM. InnerMaps transforms messy feelings into razor-sharp insights: \"Your voice shook when discussing your father—let's explore why.\" Speak freely—we'll handle the analysis.",
      category: "technical"
    },
    {
      question: "How does InnerMaps help with my emotional intelligence?",
      tagline: "We give you X-ray vision for your emotions.",
      answer: "Most people guess at their feelings. InnerMaps decodes them. After 30 days, you'll wield phrases like: \"I'm not angry—I'm grieving unmet expectations from Memory #12.\" Emotional intelligence isn't soft—it's the ultimate power move, and we're your cheat code.",
      category: "experience"
    },
    {
      question: "Can InnerMaps help me track my mood patterns?",
      tagline: "We predict your emotional weather before clouds form.",
      answer: "Our mood tracker isn't a cute graph—it's a radar for incoming storms. Journal that you're \"fine,\" and the AI might warn: \"You said 'fine' before your last panic attack. Let's reroute.\" You'll start spotting disasters before they hit—then laugh as you dodge them.",
      category: "features"
    },
    {
      question: "Is there a limit to how much I can journal or chat with the Coach?",
      tagline: "Unlimited therapy-grade insights for less than your Netflix subscription.",
      answer: "Write novels or drop single sentences—we'll mine gold from crumbs. The 150-memory limit? That's your curated gallery of life-changing moments. Think of it as your Greatest Hits album, handpicked by an AI that knows your soul better than your mother.",
      category: "technical"
    }
  ];

  // Filter FAQs based on search query and active category
  useEffect(() => {
    let filtered = faqs;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        faq => 
          faq.question.toLowerCase().includes(query) || 
          faq.answer.toLowerCase().includes(query) ||
          faq.tagline.toLowerCase().includes(query)
      );
    }
    
    setFilteredFaqs(filtered);
    
    // Reset open index when filters change
    if (filtered.length > 0) {
      setOpenIndex(null);
    }
  }, [searchQuery, activeCategory]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#6C63FF]/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000" />
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#8A6AFD]/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-3000" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#9D4EDD]/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#6C63FF] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Everything you need to know about InnerMaps and how it can transform your life
          </p>
        </motion.div>

        {/* Search and filter bar */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-base font-normal focus:ring-[#8A6AFD] focus:border-[#8A6AFD] bg-white/90 backdrop-blur-sm"
              placeholder="Search for questions or keywords..."
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-500 mr-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" /> Filter:
            </span>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] text-white shadow-md'
                      : 'bg-white/80 text-gray-600 hover:bg-[#6C63FF]/10 hover:text-[#8A6AFD]'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          {/* Reset filters button */}
          {(activeCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mx-auto flex items-center text-sm font-medium text-[#6C63FF] hover:text-[#8A6AFD] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3 py-1.5 rounded-lg transition-colors duration-300"
            >
              <X className="h-4 w-4 mr-1" />
              Reset filters
            </button>
          )}
        </div>

        {/* FAQ list */}
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <AnimatePresence>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  tagline={faq.tagline}
                  isOpen={openIndex === index}
                  toggleOpen={() => toggleFAQ(index)}
                  index={index}
                  category={faq.category}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600 text-lg">No matching questions found.</p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-[#6C63FF] hover:text-[#8A6AFD] font-medium"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center text-[#6C63FF] hover:text-[#8A6AFD] font-medium group"
          >
            <MessageCircle className="h-5 w-5 mr-2 text-[#8A6AFD]" />
            Contact us
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-[#8A6AFD] mt-0.5"></span>
          </button>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsContactModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 mx-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '450px',
                width: '90%',
                margin: '0 auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-[#6C63FF]">Contact Us</h3>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-[#8A6AFD]" />
                  <span className="font-medium">support@innermaps.co</span>
                </div>
                <p className="text-gray-600">
                  You can contact us at this email address and we will try to respond within 48 hours.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    window.location.href = "mailto:support@innermaps.co";
                    setIsContactModalOpen(false);
                  }}
                  className="bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 mr-3"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
} 