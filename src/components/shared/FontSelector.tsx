import React from 'react';
import { Type } from 'lucide-react';

interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

export const fontOptions = [
  { class: 'font-sans', name: 'System UI', category: 'Clean' },
  { class: 'font-serif', name: 'Serif', category: 'Classic' },
  { class: 'font-mono', name: 'Monospace', category: 'Technical' }
];

export function FontSelector({ currentFont, onFontChange }: FontSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Type className="w-4 h-4 text-blue-500" />
      <select
        value={currentFont}
        onChange={(e) => onFontChange(e.target.value)}
        className="text-sm bg-transparent border-none text-blue-600 focus:ring-0 cursor-pointer"
      >
        {fontOptions.map((font) => (
          <option key={font.class} value={font.class}>
            {font.name}
          </option>
        ))}
      </select>
    </div>
  );
}