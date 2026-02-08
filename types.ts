export interface MuscleGroup {
  id: string;
  name: string;
}

export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  activity: number;
  maturity: number;
  days: string[]; // ['Seg', 'Ter', ...]
  modules: string[]; // ['DailyAbs', 'DailyCardio']
  priorities: string[]; // ['chest', 'back']
  customGoal: string;
  plan: WorkoutPlan | null;
}

export interface WorkoutDay {
  foco: string;
  exercicios: string[];
}

export interface WorkoutPlan {
  [key: string]: WorkoutDay;
}

export interface ExecutionSet {
  set: number;
  weight: string;
  reps: string;
  rpe: string;
}

export interface ExecutionLog {
  id?: string;
  date: string;
  exercise: string;
  sets: ExecutionSet[];
  notes: string;
  timestamp: number;
}

export interface DailyReport {
  id?: string;
  date: string;
  analysis: string;
  timestamp: number;
}

export type ViewState = 'nexus' | 'forge' | 'stream';

export const DAYS_OF_WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];