import { type Homework, type Note, SUBJECTS, CLASS_GROUPS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/supabase';
import { useNotes, useHomework } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Calendar,
  Flag,
  StickyNote,
  Save,
  Pencil,
  ClipboardList,
  Lock,
} from 'lucide-react';
import Modal from './Modal';

type PlannerProps = {
  onToast: (msg: string) => void;
  classGroup: string;
};

export default function Planner({ onToast, classGroup }: PlannerProps) {
  const { homework, addHw, toggleHw, deleteHw } = useHomework();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [hwModalOpen, setHwModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleDeleteHw = (hw: Homework) => {
    if (!confirm('Удалить это задание?')) return;
    deleteHw(hw.id);
    onToast('Задание удалено');
  };

  const handleDeleteNote = (note: Note) => {
    if (!confirm('Удалить заметку?')) return;
    deleteNote(note.id);
    onToast('Заметка удалена');
  };

  const handleSaveNote = (id: string | null, title: string, content: string) => {
    if (id) updateNote(id, title, content);
    else addNote(title, content);
    setNoteModalOpen(false);
    setEditingNote(null);
    onToast('Заметка сохранена');
  };

  const filteredHw = homework.filter((h) => h.class_group === classGroup);

  const sortedHw = [...filteredHw].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const pending = filteredHw.filter((h) => !h.completed).length;
  const done = filteredHw.filter((h) => h.completed).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-ink-100">{filteredHw.length}</p>
          <p className="text-xs text-ink-400">Всего заданий</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-amber-400">{pending}</p>
          <p className="text-xs text-ink-400">Невыполнено</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-emerald-400">{done}</p>
          <p className="text-xs text-ink-400">Выполнено</p>
        </div>
      </div>

      {/* Homework section */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-ink-100">Домашнее задание</h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
              <Lock className="h-3 w-3" />
              Локально
            </span>
            <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-[11px] font-medium text-brand-300">
              {classGroup}
            </span>
          </div>
          <button onClick={() => setHwModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        {sortedHw.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-800 ring-1 ring-ink-700">
              <ClipboardList className="h-8 w-8 text-ink-500" />
            </div>
            <p className="text-sm text-ink-400">Нет заданий для класса {classGroup}. Добавьте первое!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedHw.map((hw) => (
              <HwItem
                key={hw.id}
                hw={hw}
                onToggle={() => toggleHw(hw.id)}
                onDelete={() => handleDeleteHw(hw)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Notes section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-ink-100">Заметки и конспекты</h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
              <Lock className="h-3 w-3" />
              Локально
            </span>
          </div>
          <button
            onClick={() => { setEditingNote(null); setNoteModalOpen(true); }}
            className="btn-ghost"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Новая заметка</span>
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-800 ring-1 ring-ink-700">
              <StickyNote className="h-8 w-8 text-ink-500" />
            </div>
            <p className="text-sm text-ink-400">Нет заметок. Создайте первую!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => { setEditingNote(note); setNoteModalOpen(true); }}
                onDelete={() => handleDeleteNote(note)}
              />
            ))}
          </div>
        )}
      </section>

      {/* HW Modal */}
      <HwModal
        open={hwModalOpen}
        onClose={() => setHwModalOpen(false)}
        onSaved={() => { setHwModalOpen(false); onToast('Задание добавлено'); }}
        onToast={onToast}
        classGroup={classGroup}
        onAdd={addHw}
      />

      {/* Note Modal */}
      <NoteModal
        open={noteModalOpen}
        onClose={() => { setNoteModalOpen(false); setEditingNote(null); }}
        onSaved={handleSaveNote}
        onToast={onToast}
        editingNote={editingNote}
      />
    </div>
  );
}

/* ---------- Homework Item ---------- */

function HwItem({ hw, onToggle, onDelete }: { hw: Homework; onToggle: () => void; onDelete: () => void }) {
  const due = new Date(hw.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = !hw.completed && due < today;
  const dueStr = due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <div className={`card p-3.5 transition-all ${hw.completed ? 'opacity-50' : 'hover:border-ink-600'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all active:scale-90 ${
            hw.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-ink-600 hover:border-emerald-500'
          }`}
          aria-label={hw.completed ? 'Отметить невыполненным' : 'Отметить выполненным'}
        >
          {hw.completed && <Check className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="rounded-md bg-ink-800 px-2 py-0.5 text-[11px] font-medium text-brand-300">
                {hw.subject}
              </span>
              <p className={`mt-1.5 text-sm leading-snug ${hw.completed ? 'text-ink-400 line-through' : 'text-ink-100'}`}>
                {hw.description}
              </p>
            </div>
            <button
              onClick={onDelete}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'text-rose-400' : 'text-ink-400'}`}>
              <Calendar className="h-3.5 w-3.5" />
              {dueStr}
              {overdue && ' · просрочено'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[hw.priority]}`}>
              <Flag className="h-3 w-3" />
              {PRIORITY_LABELS[hw.priority]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Note Card ---------- */

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: () => void; onDelete: () => void }) {
  const updated = new Date(note.updated_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="group card p-4 hover:border-ink-600">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-100">{note.title}</h3>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-200"
            aria-label="Редактировать"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Удалить"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-300">{note.content}</p>
      <p className="mt-3 text-[11px] text-ink-500">{updated}</p>
    </div>
  );
}

/* ---------- Homework Modal ---------- */

function HwModal({ open, onClose, onSaved, onToast, classGroup, onAdd }: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onToast: (m: string) => void;
  classGroup: string;
  onAdd: (hw: Omit<Homework, 'id' | 'created_at' | 'completed'>) => void;
}) {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>(classGroup);

  useEffect(() => {
    if (open) setSelectedClassGroup(classGroup);
  }, [open, classGroup]);

  const reset = () => {
    setSubject(SUBJECTS[0]);
    setDescription('');
    setDueDate(new Date().toISOString().slice(0, 10));
    setPriority('normal');
    setSelectedClassGroup(classGroup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      onToast('Введите описание задания');
      return;
    }
    onAdd({
      subject,
      description: description.trim(),
      due_date: dueDate,
      priority,
      class_group: selectedClassGroup,
    });
    reset();
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="Новое задание">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Предмет</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Описание ДЗ</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: №124, №125"
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Дата сдачи</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Приоритет</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
              className="input-field"
            >
              <option value="low">Низкий</option>
              <option value="normal">Обычный</option>
              <option value="high">Высокий</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Класс</label>
          <select
            value={selectedClassGroup}
            onChange={(e) => setSelectedClassGroup(e.target.value)}
            className="input-field"
          >
            {CLASS_GROUPS.map((cg) => <option key={cg} value={cg}>{cg}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Отмена</button>
          <button type="submit" className="btn-primary flex-1">
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Note Modal ---------- */

function NoteModal({ open, onClose, onSaved, onToast, editingNote }: {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string | null, title: string, content: string) => void;
  onToast: (m: string) => void;
  editingNote: Note | null;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(editingNote?.title ?? '');
      setContent(editingNote?.content ?? '');
    }
  }, [open, editingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Введите заголовок');
      return;
    }
    onSaved(editingNote?.id ?? null, title.trim(), content.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title={editingNote ? 'Редактировать заметку' : 'Новая заметка'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Конспект по биологии"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Содержание</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Текст заметки или конспекта..."
            rows={8}
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Отмена</button>
          <button type="submit" className="btn-primary flex-1">
            <Save className="h-4 w-4" />
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
}
