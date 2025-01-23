import React from 'react';
import { type LucideIcon, XCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorAlert({ 
  title, 
  message, 
  icon: Icon = XCircle,
  action
}: ErrorAlertProps) {
  return (
    <div className="rounded-lg bg-red-50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-600"
              >
                <RefreshCw className="h-4 w-4" />
                {action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}