import React, { useState } from 'react';
import { TermsOfService, TermsOfServiceAcceptance } from '../../legal/TermsOfService';
import { PrivacyPolicy, PrivacyPolicyAcceptance } from '../../legal/PrivacyPolicy';

type LegalAgreementsProps = {
  onComplete: (accepted: boolean) => void;
};

export function LegalAgreements({ onComplete }: LegalAgreementsProps) {
  const [step, setStep] = useState<'terms' | 'privacy' | 'completed'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setStep('privacy');
  };

  const handleTermsDecline = () => {
    setTermsAccepted(false);
    onComplete(false);
  };

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
    setStep('completed');
    onComplete(true);
  };

  const handlePrivacyDecline = () => {
    setPrivacyAccepted(false);
    onComplete(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">
            Legal Agreements
          </h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${step === 'terms' || termsAccepted ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-16 h-1 ${termsAccepted ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'privacy' || privacyAccepted ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Before you can use InnerMaps, please review and accept our legal agreements. These documents outline your rights and responsibilities as a user of our service.
        </p>
      </div>

      {step === 'terms' && (
        <div className="animate-fadeIn">
          <TermsOfServiceAcceptance 
            onAccept={handleTermsAccept} 
            onDecline={handleTermsDecline} 
          />
        </div>
      )}

      {step === 'privacy' && (
        <div className="animate-fadeIn">
          <PrivacyPolicyAcceptance 
            onAccept={handlePrivacyAccept} 
            onDecline={handlePrivacyDecline} 
          />
        </div>
      )}

      {step === 'completed' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 p-6 shadow-sm animate-fadeIn">
          <div className="text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Agreements Accepted</h3>
            <p className="text-gray-600 mb-6">
              Thank you for accepting our Terms of Service and Privacy Policy. You can now proceed with your registration.
            </p>
            <button
              onClick={() => onComplete(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS or tailwind.config.js
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.3s ease-out forwards;
// } 