import React from 'react';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
      <span className="text-xl font-semibold gradient-text">InnerMaps</span>
    </Link>
  );
}

export function LogoSmall() {
  return (
    <div className="relative w-6 h-6">
      {/* Blue circle with subtle gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500" />
      
      {/* White inner circle with subtle shadow */}
      <div className="absolute inset-1.5 rounded-full bg-white shadow-inner" />
    </div>
  );
}
