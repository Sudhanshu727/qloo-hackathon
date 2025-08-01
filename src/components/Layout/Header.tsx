import React from 'react';
import { Sparkles, Palette, Search } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'search', name: 'Smart Search', icon: Search },
  { id: 'suggestions', name: 'Get Inspired', icon: Sparkles },
  { id: 'culture', name: 'Cultural Fusion', icon: Palette },
  { id: 'unique', name: 'Unique Style', icon: Sparkles },
  { id: 'twin', name: 'Fashion Twin', icon: Sparkles },
];

export const Header: React.FC<HeaderProps> = ({ activeSection, onSectionChange }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Fashion AI
              </h1>
              <p className="text-xs text-gray-500">Powered by Qloo Intelligence</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {sections.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  activeSection === id
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </button>
            ))}
          </nav>

          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {sections.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};