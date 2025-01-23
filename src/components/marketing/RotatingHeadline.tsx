import React, { useState, useEffect } from 'react';

interface RotatingHeadlineProps {
  headlines: string[];
}

export function RotatingHeadline({ headlines }: RotatingHeadlineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((current) => (current + 1) % headlines.length);
        setIsVisible(true);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div className="h-8">
      <p 
        className={`text-lg text-blue-600 font-medium transition-all duration-200 ${
          isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-1'
        }`}
      >
        {headlines[currentIndex]}
      </p>
    </div>
  );
}