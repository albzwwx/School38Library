import { supabase, type Book, SUBJECTS, GRADES } from '@/lib/supabase';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  FileText,
  Trash2,
  Upload,
  X,
  Loader2,
  BookOpen,
  Filter,
} from 'lucide-react';
import Modal from './Modal';

type LibraryProps = {
  refreshKey: number;
  onToast: (msg: string) => void;
};

export default function Library({ refreshKey, onToast }: LibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError('Не удалось загрузить книги. Проверьте подключение.');
      setBooks([]);
    } else {
      setBooks(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, refreshKey]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (subjectFilter && b.subject !== subjectFilter) return false;
      if (gradeFilter && b.grade !== gradeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        if (!b.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [books, search, subjectFilter, gradeFilter]);

  const handleDelete = async (book: Book) => {
    if (!confirm(`Удалить «${book.title}»? Файл будет удалён безвозвратно.`)) return;
    await supabase.storage.from('books').remove([book.file_path]);
    const { error } = await supabase.from('books').delete().eq('id', book.id);
    if (error) {
      onToast('Ошибка при удалении');
    } else {
      onToast('Книга удалена');
      fetchBooks();
    }
  };

  const activeFilterCount =
    (subjectFilter ? 1 : 0) + (gradeFilter ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Search + actions */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-ghost ${showFilters ? 'border-brand-500/50 text-brand-300' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span>Фильтры</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Загрузить книгу</span>
            <span className="sm:hidden">Загрузить</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-5 animate-fade-in rounded-2xl border border-ink-800 bg-ink-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Предмет</span>
            {subjectFilter && (
              <button onClick={() => setSubjectFilter(null)} className="text-xs text-brand-400 hover:underline">
                Сбросить
              </button>
            )}
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(subjectFilter === s ? null : s)}
                className={`chip ${
                  subjectFilter === s
                    ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                    : 'border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Класс</span>
            {gradeFilter && (
              <button onClick={() => setGradeFilter(null)} className="text-xs text-brand-400 hover:underline">
                Сбросить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
                className={`chip ${
                  gradeFilter === g
                    ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                    : 'border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600'
                }`}
              >
                {g} класс
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filter chips (always visible when active) */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {subjectFilter && (
            <span className="chip border-brand-500/40 bg-brand-500/10 text-brand-300">
              {subjectFilter}
              <button onClick={() => setSubjectFilter(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {gradeFilter && (
            <span className="chip border-brand-500/40 bg-brand-500/10 text-brand-300">
              {gradeFilter} класс
              <button onClick={() => setGradeFilter(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <p className="text-ink-400">{error}</p>
          <button onClick={fetchBooks} className="btn-ghost">Повторить</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasBooks={books.length > 0} onUpload={() => setUploadOpen(true)} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onOpen={() => setViewingBook(book)}
              onDelete={() => handleDelete(book)}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {
          setUploadOpen(false);
          fetchBooks();
          onToast('Книга загружена');
        }}
        onToast={onToast}
      />

      {/* PDF viewer */}
      {viewingBook && (
        <PdfViewer book={viewingBook} onClose={() => setViewingBook(null)} />
      )}
    </div>
  );
}

/* ---------- Book Card ---------- */

function BookCard({ book, onOpen, onDelete }: { book: Book; onOpen: () => void; onDelete: () => void }) {
  return (
    <div className="group card hover:border-ink-600 hover:shadow-xl hover:shadow-black/30">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-ink-800 to-ink-850">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
          <FileText className="h-12 w-12 text-ink-500 transition-transform group-hover:scale-110" />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-ink-200 backdrop-blur-sm">
            PDF
          </span>
        </div>
      </button>
      <div className="p-3">
        <button onClick={onOpen} className="block w-full text-left">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-100 group-hover:text-brand-300">
            {book.title}
          </h3>
        </button>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className="rounded-md bg-ink-800 px-2 py-0.5 text-[11px] font-medium text-ink-300">
              {book.subject}
            </span>
            <span className="rounded-md bg-ink-800 px-2 py-0.5 text-[11px] font-medium text-ink-300">
              {book.grade} кл.
            </span>
          </div>
          <button
            onClick={onDelete}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */

function EmptyState({ hasBooks, onUpload }: { hasBooks: boolean; onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-800 ring-1 ring-ink-700">
        <BookOpen className="h-10 w-10 text-ink-500" />
      </div>
      <div>
        <p className="text-lg font-semibold text-ink-200">
          {hasBooks ? 'Ничего не найдено' : 'Библиотека пуста'}
        </p>
        <p className="mt-1 text-sm text-ink-400">
          {hasBooks
            ? 'Попробуйте изменить поиск или фильтры'
            : 'Загрузите свой первый учебник в формате PDF'}
        </p>
      </div>
      {!hasBooks && (
        <button onClick={onUpload} className="btn-primary">
          <Plus className="h-4 w-4" />
          Загрузить книгу
        </button>
      )}
    </div>
  );
}

/* ---------- Upload Modal ---------- */

function UploadModal({
  open,
  onClose,
  onUploaded,
  onToast,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
  onToast: (msg: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [grade, setGrade] = useState<number>(GRADES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setSubject(SUBJECTS[0]);
    setGrade(GRADES[0]);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onToast('Выберите PDF-файл');
      return;
    }
    if (file.type !== 'application/pdf') {
      onToast('Только PDF-файлы');
      return;
    }
    setSaving(true);

    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = `${fileName}`;

    const { error: upErr } = await supabase.storage
      .from('books')
      .upload(filePath, file, { contentType: 'application/pdf' });

    if (upErr) {
      onToast('Ошибка загрузки файла');
      setSaving(false);
      return;
    }

    const { error: dbErr } = await supabase.from('books').insert({
      title: title.trim() || file.name.replace(/\.pdf$/i, ''),
      subject,
      grade,
      file_path: filePath,
      file_size: file.size,
    });

    if (dbErr) {
      await supabase.storage.from('books').remove([filePath]);
      onToast('Ошибка сохранения');
      setSaving(false);
      return;
    }

    reset();
    setSaving(false);
    onUploaded();
  };

  return (
    <Modal open={open} onClose={onClose} title="Загрузить учебник">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Алгебра 8 класс"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Предмет</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Класс</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="input-field"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g} класс</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">PDF-файл</label>
          <FileDropzone file={file} onChange={setFile} />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Отмена
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Загрузить
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- File Dropzone ---------- */

function FileDropzone({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && f.type === 'application/pdf') onChange(f);
      }}
      className={`relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
        dragging
          ? 'border-brand-500 bg-brand-500/5'
          : file
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-ink-700 bg-ink-850'
      }`}
    >
      {file ? (
        <>
          <FileText className="h-8 w-8 text-emerald-400" />
          <p className="text-sm font-medium text-ink-200">{file.name}</p>
          <p className="text-xs text-ink-400">{(file.size / 1024 / 1024).toFixed(1)} МБ</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-1 text-xs text-rose-400 hover:underline"
          >
            Убрать файл
          </button>
        </>
      ) : (
        <>
          <Upload className="h-7 w-7 text-ink-500" />
          <p className="text-sm text-ink-300">Перетащите PDF сюда или нажмите</p>
          <label className="mt-1 cursor-pointer text-sm font-medium text-brand-400 hover:underline">
            выбрать файл
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChange(f);
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}

/* ---------- PDF Viewer ---------- */

function PdfViewer({ book, onClose }: { book: Book; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const { data } = supabase.storage.from('books').getPublicUrl(book.file_path);
    if (data?.publicUrl) {
      setUrl(data.publicUrl);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [book.file_path]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950">
      <div className="flex items-center justify-between gap-3 border-b border-ink-800 bg-ink-900 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-100"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink-100">{book.title}</h2>
            <p className="text-xs text-ink-400">{book.subject} · {book.grade} класс</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-400">
            <FileText className="h-10 w-10" />
            <p>Не удалось открыть файл</p>
          </div>
        ) : (
          <iframe
            src={url ?? ''}
            title={book.title}
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  );
}
