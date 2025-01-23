import React, { useState } from 'react';
import { Map, LogOut, User, ChevronDown } from 'lucide-react';
import { signOut } from '../../lib/auth';
import { ProfileDropdown } from './ProfileDropdown';
import { useProfile } from '../../hooks/useProfile';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profile, isLoading } = useProfile();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              InnerMaps
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                  {!isLoading && profile?.fullName ? (
                    <span className="text-sm font-medium">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <ProfileDropdown 
                  onClose={() => setIsDropdownOpen(false)}
                  profile={profile}
                />
              )}
            </div>
            
            <div className="border-l border-gray-200 h-6 mx-2" />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}