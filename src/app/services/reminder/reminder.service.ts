import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Reminder } from '../../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(private afs: AngularFirestore) {}

  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<void> {
    const reminderDoc: Reminder = {
      ...reminder,
      createdAt: new Date()
    };
    await this.afs.collection('reminders').add(reminderDoc);
  }

  getUserReminders(userId: string): Observable<Reminder[]> {
    return this.afs.collection<Reminder>('reminders', ref =>
      ref.where('userId', '==', userId)
    ).valueChanges({ idField: 'id' });
  }

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    await this.afs.doc(`reminders/${reminderId}`).update(updates);
  }

  async deleteReminder(reminderId: string): Promise<void> {
    await this.afs.doc(`reminders/${reminderId}`).delete();
  }
}