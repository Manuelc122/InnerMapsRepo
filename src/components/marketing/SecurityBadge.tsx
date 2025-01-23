import React from 'react';
import { Shield, Lock } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
      <Shield className="w-4 h-4" />
      <span>Military-grade encryption</span>
      <Lock className="w-4 h-4" />
      <span>GDPR Compliant</span>
    </div>
  );
}