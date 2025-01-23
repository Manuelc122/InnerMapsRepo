import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface ConfirmButtonProps {
  onConfirm: () => void;
  label: string;
  confirmMessage: string;
  variant?: 'default' | 'ghost';
}

export function ConfirmButton({ 
  onConfirm, 
  label, 
  confirmMessage,
  variant = 'default'
}: ConfirmButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const baseStyles = variant === 'ghost' 
    ? 'text-white/80 hover:text-white' 
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-600">{confirmMessage}</span>
          <button
            onClick={() => {
              onConfirm();
              setShowConfirm(false);
            }}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${baseStyles}`}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </button>
      )}
    </div>
  );
}