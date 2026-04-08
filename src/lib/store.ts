
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Step {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  isImportant: boolean;
  isMyDay: boolean;
  dueDate?: string;
  steps: Step[];
  listId: string;
  createdAt: string;
}

export interface ProjectList {
  id: string;
  title: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  checklistMode?: boolean;
}

export type ThemeVariant = 'umber' | 'coffee' | 'forest' | 'slate' | 'burgundy' | 'classic';
export type AppPlatform = 'web' | 'mobile' | 'desktop';

interface MyNoteState {
  notes: Note[];
  tasks: Task[];
  projects: ProjectList[];
  activeNoteId: string | null;
  activeProjectId: string;
  activeView: 'dashboard' | 'tasks' | 'my-day' | 'important' | 'calendar' | 'timeline' | 'settings' | 'all-tasks';
  theme: 'light' | 'dark';
  themeVariant: ThemeVariant;
  platform: AppPlatform;
  
  // App Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  setPlatform: (platform: AppPlatform) => void;
  setActiveView: (view: MyNoteState['activeView']) => void;
  setActiveProjectId: (id: string) => void;
  
  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  
  // Task Actions
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskImportance: (id: string) => void;
  
  // Project Actions
  addProject: (title: string) => void;
  deleteProject: (id: string) => void;

  // Step Actions
  addTaskStep: (taskId: string, title: string) => void;
  updateTaskStep: (taskId: string, stepId: string, title: string) => void;
  toggleTaskStep: (taskId: string, stepId: string) => void;
  deleteTaskStep: (taskId: string, stepId: string) => void;
}

export const useStore = create<MyNoteState>()(
  persist(
    (set) => ({
      notes: [
        {
          id: '1',
          title: 'ALWIN SYSTEM INITIALIZED',
          content: 'Professional high-density task and note management system ready.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checklistMode: false,
        },
      ],
      tasks: [],
      projects: [{ id: 'default', title: 'PERSONAL TASKS' }],
      activeNoteId: null,
      activeProjectId: 'default',
      activeView: 'dashboard',
      theme: 'dark',
      themeVariant: 'coffee',
      platform: 'web',

      setTheme: (theme) => set({ theme }),
      setThemeVariant: (variant) => set({ themeVariant: variant }),
      setPlatform: (platform) => set({ platform }),
      setActiveView: (view) => set({ activeView: view, activeNoteId: null }),
      setActiveProjectId: (id) => set({ activeProjectId: id, activeView: 'tasks', activeNoteId: null }),

      addNote: (note) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          activeNoteId: id,
          activeView: 'dashboard'
        }));
      },
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
      })),
      setActiveNote: (id) => set({ activeNoteId: id, activeView: 'dashboard' }),

      addTask: (task) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newTask = {
          title: 'NEW ACTION ITEM',
          completed: false,
          isImportant: false,
          isMyDay: task.dueDate === today,
          steps: [],
          listId: task.listId || state.activeProjectId,
          dueDate: task.dueDate || today,
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        } as Task;

        return {
          tasks: [newTask, ...state.tasks],
        };
      }),
      updateTask: (id, updates) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        return {
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const updated = { ...t, ...updates };
              if (updates.dueDate) {
                updated.isMyDay = updates.dueDate === today;
              }
              return updated;
            }
            return t;
          }),
        };
      }),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      toggleTaskImportance: (id) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, isImportant: !t.isImportant } : t)),
      })),

      addProject: (title) => set((state) => ({
        projects: [...state.projects, { id: Math.random().toString(36).substr(2, 9), title }]
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? 'default' : state.activeProjectId
      })),

      addTaskStep: (taskId, title) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? {
          ...t,
          steps: [...t.steps, { id: Math.random().toString(36).substr(2, 9), title, completed: false }]
        } : t)
      })),
      updateTaskStep: (taskId, stepId, title) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? {
          ...t,
          steps: t.steps.map(s => s.id === stepId ? { ...s, title } : s)
        } : t)
      })),
      toggleTaskStep: (taskId, stepId) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? {
          ...t,
          steps: t.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
        } : t)
      })),
      deleteTaskStep: (taskId, stepId) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? {
          ...t,
          steps: t.steps.filter(s => s.id !== stepId)
        } : t)
      })),
    }),
    {
      name: 'alwin-note-storage',
    }
  )
);
