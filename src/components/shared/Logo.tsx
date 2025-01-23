import React from 'react';
import { motion } from 'framer-motion';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <motion.div 
        className="relative w-8 h-8"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {/* Blue circle with subtle gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500" />
        
        {/* White inner circle with subtle shadow */}
        <div className="absolute inset-1.5 rounded-full bg-white shadow-inner" />
      </motion.div>

      {/* Brand name with hover effect */}
      <motion.span 
        className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        InnerMaps
      </motion.span>
    </div>
  );
}

export function LogoSmall() {
  return (
    <motion.div 
      className="relative w-6 h-6"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* Blue circle with subtle gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500" />
      
      {/* White inner circle with subtle shadow */}
      <div className="absolute inset-1.5 rounded-full bg-white shadow-inner" />
    </motion.div>
  );
}
