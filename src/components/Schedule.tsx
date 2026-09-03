import { useScheduleImages, type ScheduleImage } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';

export default function Schedule({ onToast }: { onToast: (msg: string) => void }) {
  const { images, addImage, deleteImage } = useScheduleImages();
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<ScheduleImage | null>(null);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onToast('Только изображения (PNG, JPG)');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addImage(file.name.replace(/\.[^/.]+$/, ''), dataUrl);
      setUploading(false);
      onToast('Расписание загружено');
    };
    reader.onerror = () => {
      setUploading(false);
      onToast('Ошибка чтения файла');
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (img: ScheduleImage) => {
    if (!confirm('Удалить это расписание?')) return;
    deleteImage(img.id);
    onToast('Расписание удалено');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-bold text-ink-100">Расписание</h2>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="hidden sm:inline">Загрузить расписание</span>
          <span className="sm:hidden">Загрузить</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-800 ring-1 ring-ink-700">
            <ImageIcon className="h-10 w-10 text-ink-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-200">Нет расписания</p>
            <p className="mt-1 text-sm text-ink-400">Загрузите изображение с расписанием звонков и уроков</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.id} className="group card overflow-hidden hover:border-ink-600">
              <button
                onClick={() => setViewing(img)}
                className="relative block w-full overflow-hidden bg-ink-850"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="max-h-64 w-full object-contain transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Открыть
                </span>
              </button>
              <div className="flex items-center justify-between p-3">
                <h3 className="truncate text-sm font-medium text-ink-200">{img.name}</h3>
                <button
                  onClick={() => handleDelete(img)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <ImageViewer image={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

/* ---------- Image Viewer with Zoom ---------- */

function ImageViewer({ image, onClose }: { image: ScheduleImage; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 5));
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - 0.25, 0.5);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };
  const reset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    setDragStart({ x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    setTranslate({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-800 bg-ink-900 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-100"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="truncate text-sm font-semibold text-ink-100">{image.name}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-100 disabled:opacity-40"
            aria-label="Уменьшить"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="min-w-12 text-center text-xs font-medium text-ink-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 5}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-100 disabled:opacity-40"
            aria-label="Увеличить"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={reset}
            className="ml-1 rounded-xl bg-ink-800 px-3 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-100"
          >
            Сброс
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onDoubleClick={zoomIn}
      >
        <img
          src={image.dataUrl}
          alt={image.name}
          className="pointer-events-none absolute left-1/2 top-1/2 max-h-full max-w-full select-none"
          style={{
            transform: `translate(calc(-50% + ${translate.x}px), calc(-50% + ${translate.y}px)) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
