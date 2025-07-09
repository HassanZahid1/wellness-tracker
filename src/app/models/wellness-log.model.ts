export interface WellnessLog {
  id?: string;
  userId: string;
  type: 'water' | 'exercise' | 'sleep' | 'mood';
  date: Date;
  time: string;
  data: WaterLog | ExerciseLog | SleepLog | MoodLog;
  createdAt: Date;
}

export interface WaterLog {
  amountMl: number;
}

export interface ExerciseLog {
  activityType: string;
  durationMinutes: number;
  intensity?: string;
  notes?: string;
}

export interface SleepLog {
  sleepStart: Date;
  sleepEnd: Date;
  qualityRating?: number;
  notes?: string;
}

export interface MoodLog {
  moodType: string;
  notes?: string;
}