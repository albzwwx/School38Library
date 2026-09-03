import { useState, useEffect, useCallback } from 'react';
import type { Note, Homework } from '@/lib/supabase';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ============================================================
   NOTES — localStorage
   ============================================================ */

const NOTES_KEY = 'school-app:notes';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Note[]) : [];
  } catch {
    return [];
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => { setNotes(loadNotes()); }, []);

  const persist = useCallback((next: Note[]) => {
    setNotes(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }, []);

  const addNote = useCallback((title: string, content: string) => {
    const now = new Date().toISOString();
    const note: Note = { id: uid(), title, content, updated_at: now, created_at: now };
    persist([note, ...loadNotes()]);
  }, [persist]);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    const now = new Date().toISOString();
    persist(loadNotes().map((n) => n.id === id ? { ...n, title, content, updated_at: now } : n));
  }, [persist]);

  const deleteNote = useCallback((id: string) => {
    persist(loadNotes().filter((n) => n.id !== id));
  }, [persist]);

  return { notes, addNote, updateNote, deleteNote };
}

/* ============================================================
   HOMEWORK — localStorage
   ============================================================ */

const HW_KEY = 'school-app:homework';

function loadHw(): Homework[] {
  try {
    const raw = localStorage.getItem(HW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Homework[]) : [];
  } catch {
    return [];
  }
}

export function useHomework() {
  const [homework, setHomework] = useState<Homework[]>([]);

  useEffect(() => { setHomework(loadHw()); }, []);

  const persist = useCallback((next: Homework[]) => {
    setHomework(next);
    localStorage.setItem(HW_KEY, JSON.stringify(next));
  }, []);

  const addHw = useCallback((hw: Omit<Homework, 'id' | 'created_at' | 'completed'>) => {
    const item: Homework = {
      ...hw,
      id: uid(),
      completed: false,
      created_at: new Date().toISOString(),
    };
    persist([item, ...loadHw()]);
  }, [persist]);

  const toggleHw = useCallback((id: string) => {
    persist(loadHw().map((h) => h.id === id ? { ...h, completed: !h.completed } : h));
  }, [persist]);

  const deleteHw = useCallback((id: string) => {
    persist(loadHw().filter((h) => h.id !== id));
  }, [persist]);

  return { homework, addHw, toggleHw, deleteHw };
}

/* ============================================================
   SCHEDULE IMAGES — localStorage (base64 data URLs)
   ============================================================ */

export type ScheduleImage = {
  id: string;
  name: string;
  dataUrl: string;
  created_at: string;
};

const SCHED_KEY = 'school-app:schedule';

function loadSched(): ScheduleImage[] {
  try {
    const raw = localStorage.getItem(SCHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScheduleImage[]) : [];
  } catch {
    return [];
  }
}

export function useScheduleImages() {
  const [images, setImages] = useState<ScheduleImage[]>([]);

  useEffect(() => { setImages(loadSched()); }, []);

  const persist = useCallback((next: ScheduleImage[]) => {
    setImages(next);
    localStorage.setItem(SCHED_KEY, JSON.stringify(next));
  }, []);

  const addImage = useCallback((name: string, dataUrl: string) => {
    const img: ScheduleImage = {
      id: uid(),
      name,
      dataUrl,
      created_at: new Date().toISOString(),
    };
    persist([img, ...loadSched()]);
  }, [persist]);

  const deleteImage = useCallback((id: string) => {
    persist(loadSched().filter((i) => i.id !== id));
  }, [persist]);

  return { images, addImage, deleteImage };
}

/* ============================================================
   CLASS GROUP — localStorage
   ============================================================ */

const CLASS_KEY = 'school-app:class-group';

export function useClassGroup() {
  const [classGroup, setClassGroup] = useState<string>(() => {
    return localStorage.getItem(CLASS_KEY) || '9-А';
  });

  const changeClass = useCallback((cg: string) => {
    setClassGroup(cg);
    localStorage.setItem(CLASS_KEY, cg);
  }, []);

  return { classGroup, changeClass };
}
