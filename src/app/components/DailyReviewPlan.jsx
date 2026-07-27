import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { db } from '../../db/db';
import { getDailyReviewPlan } from '../../features/learning/services/learningMemory';

export default function DailyReviewPlan({ onOpenNote }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const due = await getDailyReviewPlan();
      const withNotes = await Promise.all(due.map(async (item) => ({ ...item, note: await db.notes.get(item.noteId) })));
      setItems(withNotes.filter((item) => item.note));
    };
    void load();
  }, []);

  if (!items.length) return null;
  return (
    <section className="mb-10 rounded-xl border border-border-subtle bg-surface-card/80 p-5">
      <div className="mb-3 flex items-center gap-2 text-content-primary">
        <FiRefreshCw className="text-primary-600" />
        <h2 className="text-lg font-semibold">Today’s review</h2>
        <span className="text-sm text-content-secondary">{items.length} cards due</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpenNote(item.noteId)} className="w-full rounded-lg bg-surface-hover px-3 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30">
            <span className="font-medium text-content-primary">{item.note.title}</span>
            <span className="ml-2 text-content-secondary">Mastery {item.mastery}/5</span>
          </button>
        ))}
      </div>
    </section>
  );
}
