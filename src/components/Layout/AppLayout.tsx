import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Journal', href: '/journal' },
  { name: 'Analysis', href: '/analysis' },
  { name: 'Chat', href: '/chat' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/journal"
                className={`text-sm font-medium ${
                  location.pathname === '/journal' 
                    ? 'text-[#4461F2]' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Journal
              </Link>
              <Link
                to="/analysis"
                className={`text-sm font-medium ${
                  location.pathname === '/analysis' 
                    ? 'text-[#4461F2]' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Analysis
              </Link>
              <Link
                to="/chat"
                className={`text-sm font-medium ${
                  location.pathname === '/chat' 
                    ? 'text-[#4461F2]' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {/* TODO: Implement settings */}}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => signOut()}
              className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="px-4 py-3 space-y-2">
              <Link
                to="/journal"
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/journal' 
                    ? 'bg-blue-50 text-[#4461F2]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Journal
              </Link>
              <Link
                to="/analysis"
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/analysis' 
                    ? 'bg-blue-50 text-[#4461F2]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Analysis
              </Link>
              <Link
                to="/chat"
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/chat' 
                    ? 'bg-blue-50 text-[#4461F2]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Chat
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
} 