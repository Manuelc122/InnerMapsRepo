import React from 'react';
import { Mail } from 'lucide-react';
import { Logo } from '../shared/Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-4 text-gray-600">
              Empowering personal growth through AI-driven journaling and self-reflection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#features" className="text-gray-600 hover:text-[#6C63FF]">Features</a>
              </li>
              <li>
                <a href="#demo" className="text-gray-600 hover:text-[#6C63FF]">Demo</a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-[#6C63FF]">Pricing</a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-[#6C63FF]">About</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="mailto:support@innermaps.co" 
                  className="inline-flex items-center text-gray-600 hover:text-[#6C63FF]"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  support@innermaps.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} InnerMaps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 