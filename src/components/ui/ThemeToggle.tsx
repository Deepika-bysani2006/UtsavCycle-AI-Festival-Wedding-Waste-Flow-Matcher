import React, { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clsx } from 'clsx';

type ThemeOption = { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode };

const OPTIONS: ThemeOption[] = [
  { value: 'light',  label: 'Light',  icon: <Sun  size={14} /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon size={14} /> },
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2];

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
          'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300',
          'hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        )}
        aria-label="Theme"
        title={`Theme: ${current.label}`}
      >
        {current.icon}
        <span className="hidden sm:inline text-xs">{current.label}</span>
        <ChevronDown size={12} className={clsx('transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={clsx(
          'absolute right-0 top-full mt-1.5 w-36 z-50',
          'bg-white dark:bg-gray-800 rounded-xl shadow-lg',
          'border border-gray-100 dark:border-gray-700',
          'py-1 overflow-hidden'
        )}>
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                theme === opt.value
                  ? 'bg-green-50 dark:bg-green-900/30 text-[#1a6b2f] dark:text-green-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60'
              )}
            >
              <span className="flex items-center gap-2">
                {opt.icon}
                {opt.label}
              </span>
              {theme === opt.value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
