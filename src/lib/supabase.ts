import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Book = {
  id: string;
  title: string;
  subject: string;
  grade: number;
  file_path: string;
  file_size: number | null;
  created_at: string;
};

export type Homework = {
  id: string;
  subject: string;
  description: string;
  due_date: string;
  priority: 'low' | 'normal' | 'high';
  completed: boolean;
  class_group: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
};

export const SUBJECTS = [
  'Математика',
  'Физика',
  'История',
  'Химия',
  'Биология',
  'Литература',
  'География',
  'Информатика',
] as const;

export const GRADES = [5, 6, 7, 8, 9, 10, 11] as const;

export const CLASS_GROUPS = [
  '5-А', '5-Б',
  '6-А', '6-Б',
  '7-А', '7-Б',
  '8-А', '8-Б',
  '9-А', '9-Б',
  '10-А', '10-Б',
  '11-А', '11-Б',
] as const;

export const PRIORITIES = ['low', 'normal', 'high'] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  normal: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};
