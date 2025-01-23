import React, { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '../../lib/auth';
import type { UserProfile } from '../../types/profile';

interface ProfileDropdownProps {
  onClose: () => void;
  profile: UserProfile | null;
}

export function ProfileDropdown({ onClose, profile }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-medium text-gray-900">
          {profile?.fullName || 'Guest User'}
        </div>
        <div className="text-sm text-gray-500">
          {profile?.country || 'Welcome'}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}