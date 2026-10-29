import React from 'react';
import {
  FileText,
  Upload,
  Moon,
  Sun,
  Code2,
  FolderOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  subject: string;
  papersCount: number;
  years: string[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUpload: () => void;
  onSelectSample: (type: 'os' | 'dsa') => void;
  onToggleJsonModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subject,
  papersCount,
  years,
  darkMode,
  onToggleDarkMode,
  onOpenUpload,
  onSelectSample,
  onToggleJsonModal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Active Subject */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-white">
                PYQ Analyzer
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                Engineering
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 truncate">
              <span className="font-medium text-stone-700 dark:text-stone-300 truncate">{subject}</span>
              <span>•</span>
              <span>{papersCount} Papers ({years.join(', ')})</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sample Switcher Dropdown / Buttons */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300">
            <span className="px-2 text-[11px] font-medium text-stone-400 dark:text-stone-500">Presets:</span>
            <button
              onClick={() => onSelectSample('os')}
              className="px-2.5 py-1 rounded font-medium hover:bg-white dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-all"
              title="Load 4-year Operating Systems PYQ dataset"
            >
              Operating Systems
            </button>
            <button
              onClick={() => onSelectSample('dsa')}
              className="px-2.5 py-1 rounded font-medium hover:bg-white dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-all"
              title="Load 4-year Data Structures & Algorithms PYQ dataset"
            >
              DSA
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload PYQs</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* JSON Export Button */}
          <button
            onClick={onToggleJsonModal}
            className="p-2 sm:px-3 sm:py-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            title="Inspect or export structured JSON output"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">JSON</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
