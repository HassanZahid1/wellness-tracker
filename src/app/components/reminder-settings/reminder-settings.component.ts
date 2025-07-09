import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reminder-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './reminder-settings.component.html',
  styleUrl: './reminder-settings.component.scss'
})
export class ReminderSettingsComponent implements OnInit {
  reminderForm: FormGroup;
  waterIntervals = [1, 2, 3, 4];
  defaultSettings = {
    water: { enabled: true, interval: 2 },
    exercise: { enabled: false, time: '18:00' },
    sleep: { enabled: true, time: '22:30' },
    mood: { enabled: true, time: '20:00' }
  };
  private reminderCheckInterval: any;
  notificationStatus: 'active' | 'blocked' | 'pending' = 'pending';
  notificationMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reminderForm = this.fb.group({
      water: this.fb.group({
        enabled: [true],
        interval: [2]
      }),
      exercise: this.fb.group({
        enabled: [false],
        time: ['18:00']
      }),
      sleep: this.fb.group({
        enabled: [true],
        time: ['22:30']
      }),
      mood: this.fb.group({
        enabled: [true],
        time: ['20:00']
      })
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.initNotifications();
  }

  ngOnDestroy() {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
    }
  }

  initNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.notificationStatus = 'active';
        this.notificationMessage = 'Reminders are active.';
      } else if (Notification.permission === 'denied') {
        this.notificationStatus = 'blocked';
        this.notificationMessage = 'Notifications are blocked. Please enable them in your browser settings.';
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.notificationStatus = 'active';
            this.notificationMessage = 'Reminders are active.';
          } else {
            this.notificationStatus = 'blocked';
            this.notificationMessage = 'Notifications are blocked. Please enable them in your browser settings.';
          }
        });
      }
      this.reminderCheckInterval = setInterval(() => this.checkReminders(), 60000); // every minute
    } else {
      this.notificationStatus = 'blocked';
      this.notificationMessage = 'Notifications are not supported in this browser.';
    }
  }

  lastTriggered: { [key: string]: string } = {};

  checkReminders() {
    const now = new Date();
    const settings = this.reminderForm.value;
    // Water Intake: interval-based
    if (settings.water.enabled) {
      const key = 'water';
      const last = this.lastTriggered[key] ? new Date(this.lastTriggered[key]) : null;
      if (!last || (now.getTime() - last.getTime()) > settings.water.interval * 60 * 60 * 1000) {
        // Only trigger during daytime hours (8am-10pm)
        if (now.getHours() >= 8 && now.getHours() <= 22) {
          this.triggerNotification('Time to drink water! Stay hydrated.');
          this.lastTriggered[key] = now.toISOString();
        }
      }
    }
    // Exercise: time-based
    if (settings.exercise.enabled) {
      this.checkTimeReminder('exercise', settings.exercise.time, 'Time to exercise! Get moving.');
    }
    // Sleep: time-based
    if (settings.sleep.enabled) {
      this.checkTimeReminder('sleep', settings.sleep.time, 'Time to prepare for bed!');
    }
    // Mood: time-based
    if (settings.mood.enabled) {
      this.checkTimeReminder('mood', settings.mood.time, 'Mood check-in: How are you feeling?');
    }
  }

  checkTimeReminder(key: string, time: string, message: string) {
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    if (now.getHours() === h && now.getMinutes() === m) {
      if (this.lastTriggered[key] !== now.toISOString().slice(0, 16)) {
        this.triggerNotification(message);
        this.lastTriggered[key] = now.toISOString().slice(0, 16);
      }
    }
  }

  triggerNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    }
  }

  loadSettings() {
    const saved = localStorage.getItem('wellnessRemindersV2');
    if (saved) {
      this.reminderForm.patchValue(JSON.parse(saved));
    } else {
      this.reminderForm.patchValue(this.defaultSettings);
    }
  }

  saveSettings() {
    localStorage.setItem('wellnessRemindersV2', JSON.stringify(this.reminderForm.value));
    this.snackBar.open('Reminder settings saved!', 'Close', { duration: 2500 });
  }

  getControl(path: string): FormControl {
    return this.reminderForm.get(path) as FormControl;
  }
}
