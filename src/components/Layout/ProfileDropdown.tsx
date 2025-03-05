import React, { useEffect, useRef } from 'react';
import { LogOut, User, CreditCard } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../../interfaces/profile';

interface ProfileDropdownProps {
  onClose: () => void;
  profile: UserProfile | null;
}

export function ProfileDropdown({ onClose, profile }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Get display name (prefer first name, fallback to full name or default)
  const getDisplayName = () => {
    if (profile?.firstName) return profile.firstName;
    if (profile?.fullName) return profile.fullName;
    return 'Guest User';
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-medium text-gray-900">
          {getDisplayName()}
        </div>
        <div className="text-sm text-gray-500">
          {profile?.country || 'Welcome'}
        </div>
      </div>

      <div className="py-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </Link>
        
        <Link
          to="/account/subscription"
          onClick={onClose}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>Manage Subscription</span>
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={() => {
            signOut();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}