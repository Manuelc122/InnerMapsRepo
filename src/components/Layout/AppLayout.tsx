import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../shared/Logo';
import { useAuth } from '../../state-management/AuthContext';
import { Settings, Book, MessageSquare } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/journal"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/journal')
                      ? 'border-b-2 border-[#4461F2] text-gray-900'
                      : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Book className="w-4 h-4 mr-2" />
                  Journal
                </Link>
                <Link
                  to="/coach"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/coach')
                      ? 'border-b-2 border-[#4461F2] text-gray-900'
                      : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Coach Chat
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-5 h-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
    </div>
  );
} 