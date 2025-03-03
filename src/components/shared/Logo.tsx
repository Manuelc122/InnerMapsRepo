import React from 'react';
import { Link } from 'react-router-dom';

const customStyles = `
  .logo-container {
    padding: 0.2rem 0.4rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }

  .logo-circle {
    width: 1.6em;
    height: 1.6em;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%);
    flex-shrink: 0;
  }

  .wordmark {
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    letter-spacing: -0.02em;
    position: relative;
    display: flex;
    gap: 0.3em;
    line-height: 1;
  }

  .wordmark-inner {
    background: linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .wordmark-maps {
    color: #4A5568;
  }

  @media (max-width: 640px) {
    .logo-container {
      padding: 0.15rem 0.35rem;
    }
    .wordmark {
      font-size: 1.5rem;
      gap: 0.25em;
    }
    .logo-circle {
      width: 1.4em;
      height: 1.4em;
    }
  }
`;

export function Logo() {
  // Add the custom styles to the document head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Link 
      to="/" 
      className="logo-container"
      aria-label="InnerMaps Home"
    >
      <div className="logo-circle"></div>
      <h1 className="text-[2rem]">
        <span className="wordmark">
          <span className="wordmark-inner">Inner</span>
          <span className="wordmark-maps">Maps</span>
        </span>
      </h1>
    </Link>
  );
}

// Small logo variant for mobile/compact views
export function LogoSmall() {
  return (
    <div 
      className="relative w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-base font-black"
      aria-label="InnerMaps Logo"
      style={{ 
        background: 'linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%)',
        color: 'white'
      }}
    >
      IM
    </div>
  );
}
