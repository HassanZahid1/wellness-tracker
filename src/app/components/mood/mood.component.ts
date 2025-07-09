import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellnessService, WellnessDay } from '../../services/wellness/wellness.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './mood.component.html',
  styleUrls: ['./mood.component.scss']
})
export class MoodComponent implements OnInit, OnDestroy {
  days: WellnessDay[] = [];
  form: FormGroup;
  viewMode: 'table' | 'cards' = 'table';
  private dataSubscription!: Subscription;
  moodOptions = [
    { value: 1, label: '😢 Very Bad', color: '#f44336' },
    { value: 2, label: '😕 Bad', color: '#ff9800' },
    { value: 3, label: '😐 Okay', color: '#ffc107' },
    { value: 4, label: '🙂 Good', color: '#4caf50' },
    { value: 5, label: '😄 Excellent', color: '#2196f3' }
  ];

  constructor(private wellness: WellnessService, private fb: FormBuilder) {
    this.form = this.fb.group({
      value: ['', [Validators.required]]
    });
    this.load();
  }

  ngOnInit(): void {
    // Subscribe to data changes
    this.dataSubscription = this.wellness.dataChanged$.subscribe(() => {
      this.load();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  async load() {
    this.days = await this.wellness.getDays();
  }

  setMood() {
    if (this.form.valid) {
      this.wellness.setMood(+this.form.value.value);
      this.form.reset();
      // Data will be automatically updated via the subscription
    }
  }

  getMoodColor(mood: number): string {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.color : '#6b7280';
  }

  getMoodLabel(mood: number): string {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.label.split(' ').slice(1).join(' ') : 'Unknown';
  }

  getMoodEmoji(mood: number): string {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.label.split(' ')[0] : '😐';
  }

  getTodayMood(): number {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = this.days.find(day => day.date === todayStr);
    return today ? today.mood : 0;
  }

  getAverageMood(): number {
    const validMoods = this.days.filter(day => day.mood > 0);
    if (validMoods.length === 0) return 0;
    const sum = validMoods.reduce((acc, day) => acc + day.mood, 0);
    return Math.round((sum / validMoods.length) * 10) / 10;
  }

  getTodayMoodEmoji(): string {
    return this.getMoodEmoji(this.getTodayMood());
  }

  getTodayMoodLabel(): string {
    return this.getMoodLabel(this.getTodayMood());
  }
} 