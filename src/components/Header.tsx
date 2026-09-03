import { BookOpen, ClipboardList, CalendarDays, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CLASS_GROUPS } from '@/lib/supabase';

export type Tab = 'library' | 'planner' | 'schedule';

type HeaderProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  classGroup: string;
  onClassGroupChange: (cg: string) => void;
};

export default function Header({ activeTab, onTabChange, classGroup, onClassGroupChange }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const tabs: { id: Tab; label: string; shortLabel: string; icon: typeof BookOpen }[] = [
    { id: 'library', label: 'Библиотека', shortLabel: 'Книги', icon: BookOpen },
    { id: 'planner', label: 'Заметки / ДЗ', shortLabel: 'ДЗ', icon: ClipboardList },
    { id: 'schedule', label: 'Расписание', shortLabel: 'Расп.', icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-500/30">
              <BookOpen className="h-5 w-5 text-brand-400" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-bold leading-tight text-ink-100">Школьник</h1>
              <p className="text-[11px] leading-tight text-ink-400">Библиотека + Планер ДЗ</p>
            </div>
          </div>

          {/* Class selector */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-900 px-3 py-2 text-sm font-semibold text-ink-100 transition-colors hover:border-ink-600"
            >
              <span className="text-brand-400">{classGroup}</span>
              <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 animate-scale-in rounded-xl border border-ink-700 bg-ink-850 p-1.5 shadow-2xl">
                <div className="max-h-64 overflow-y-auto">
                  {CLASS_GROUPS.map((cg) => (
                    <button
                      key={cg}
                      onClick={() => {
                        onClassGroupChange(cg);
                        setDropdownOpen(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        cg === classGroup
                          ? 'bg-brand-500 text-white'
                          : 'text-ink-200 hover:bg-ink-800'
                      }`}
                    >
                      {cg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs row */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all whitespace-nowrap sm:px-4 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
                }`}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
