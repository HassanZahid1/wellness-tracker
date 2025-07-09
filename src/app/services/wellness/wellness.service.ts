import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, DocumentData } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user.model';

export interface WellnessDay {
  date: string; // YYYY-MM-DD
  water: number;
  exercise: number;
  sleep: number;
  mood: number;
}

export interface WellnessGoals {
  water: number;
  exercise: number;
  sleep: number;
  mood: number;
}

@Injectable({ providedIn: 'root' })
export class WellnessService {
  private readonly DAYS = 7;
  private user: User | null = null;
  private dataChangeSubject = new BehaviorSubject<void>(undefined);
  public dataChanged$ = this.dataChangeSubject.asObservable();

  constructor(private firestore: Firestore, private auth: AuthService) {
    this.auth.user$.subscribe(user => {
      this.user = user;
      this.notifyDataChange();
    });
  }

  // Get all days (last 7) from Firestore
  async getDays(): Promise<WellnessDay[]> {
    if (!this.user) return this.fillMissingDays([]);
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/data`);
    const docSnap = await getDoc(docRef);
    let days: WellnessDay[] = [];
    if (docSnap.exists()) {
      days = docSnap.data()['days'] || [];
    }
    return this.fillMissingDays(days);
  }

  // Add activity to today
  async addActivity(type: 'water' | 'exercise' | 'sleep' | 'mood', value: number) {
    if (!this.user) return;
    const days = await this.getDays();
    const todayStr = this.getTodayStr();
    let today = days.find(d => d.date === todayStr);
    if (!today) {
      today = { date: todayStr, water: 0, exercise: 0, sleep: 0, mood: 0 };
      days.push(today);
    }
    today[type] += value;
    const trimmed = this.trimToLast7(days);
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/data`);
    await setDoc(docRef, { days: trimmed }, { merge: true });
    this.notifyDataChange();
  }

  // Set sleep for today (overwrite)
  async setSleep(hours: number) {
    if (!this.user) return;
    const days = await this.getDays();
    const todayStr = this.getTodayStr();
    let today = days.find(d => d.date === todayStr);
    if (!today) {
      today = { date: todayStr, water: 0, exercise: 0, sleep: 0, mood: 0 };
      days.push(today);
    }
    today.sleep = hours;
    const trimmed = this.trimToLast7(days);
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/data`);
    await setDoc(docRef, { days: trimmed }, { merge: true });
    this.notifyDataChange();
  }

  // Set mood for today (overwrite)
  async setMood(rating: number) {
    if (!this.user) return;
    const days = await this.getDays();
    const todayStr = this.getTodayStr();
    let today = days.find(d => d.date === todayStr);
    if (!today) {
      today = { date: todayStr, water: 0, exercise: 0, sleep: 0, mood: 0 };
      days.push(today);
    }
    today.mood = rating;
    const trimmed = this.trimToLast7(days);
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/data`);
    await setDoc(docRef, { days: trimmed }, { merge: true });
    this.notifyDataChange();
  }

  // Get goals from Firestore
  async getGoals(): Promise<WellnessGoals> {
    if (!this.user) return { water: 8, exercise: 30, sleep: 8, mood: 3 };
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/goals`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as WellnessGoals;
    }
    return { water: 8, exercise: 30, sleep: 8, mood: 3 };
  }

  // Set goals in Firestore
  async setGoals(goals: WellnessGoals) {
    if (!this.user) return;
    const docRef = doc(this.firestore, `users/${this.user.uid}/wellness/goals`);
    await setDoc(docRef, goals, { merge: true });
    this.notifyDataChange();
  }

  // Update single goal
  async updateGoal(type: keyof WellnessGoals, value: number) {
    if (!this.user) return;
    const goals = await this.getGoals();
    goals[type] = value;
    await this.setGoals(goals);
  }

  // Notify all subscribers of data changes
  private notifyDataChange(): void {
    this.dataChangeSubject.next();
  }

  // Helpers
  private getTodayStr(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private trimToLast7(days: WellnessDay[]): WellnessDay[] {
    return days.sort((a, b) => a.date.localeCompare(b.date)).slice(-this.DAYS);
  }
  private fillMissingDays(days: WellnessDay[]): WellnessDay[] {
    const result: WellnessDay[] = [];
    const today = new Date();
    for (let i = this.DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      let day = days.find(day => day.date === dateStr);
      if (!day) day = { date: dateStr, water: 0, exercise: 0, sleep: 0, mood: 0 };
      result.push(day);
    }
    return result;
  }
}