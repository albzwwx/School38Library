import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Header, { type Tab } from '@/components/Header';
import Library from '@/components/Library';
import Planner from '@/components/Planner';
import Schedule from '@/components/Schedule';
import { useClassGroup } from '@/lib/hooks';

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3 shadow-2xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <span className="text-sm font-medium text-ink-100">{message}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('library');
  const [toast, setToast] = useState<string | null>(null);
  const { classGroup, changeClass } = useClassGroup();

  const showToast = useCallback((msg: string) => setToast(msg), []);

  return (
    <div className="min-h-screen bg-ink-950">
      <Header
        activeTab={tab}
        onTabChange={setTab}
        classGroup={classGroup}
        onClassGroupChange={changeClass}
      />

      <main className="pb-8">
        {tab === 'library' && <Library refreshKey={0} onToast={showToast} />}
        {tab === 'planner' && <Planner onToast={showToast} classGroup={classGroup} />}
        {tab === 'schedule' && <Schedule onToast={showToast} />}
      </main>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
