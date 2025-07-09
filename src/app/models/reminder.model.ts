export interface Reminder {
  id?: string;
  userId: string;
  reminderType: 'water' | 'exercise' | 'sleep' | 'mood';
  reminderTime: string;
  isActive: boolean;
  frequency: string;
  createdAt: Date;
}
