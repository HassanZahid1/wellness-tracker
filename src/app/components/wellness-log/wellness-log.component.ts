import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-wellness-log',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './wellness-log.component.html',
  styleUrl: './wellness-log.component.scss'
})
export class WellnessLogComponent implements OnInit {
  wellnessForm: FormGroup;
  activities: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.wellnessForm = this.fb.group({
      date: [new Date(), Validators.required],
      activityType: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    const savedActivities = localStorage.getItem('wellnessActivities');
    if (savedActivities) {
      this.activities = JSON.parse(savedActivities);
    }
  }

  saveActivities() {
    localStorage.setItem('wellnessActivities', JSON.stringify(this.activities));
  }

  onSubmit() {
    if (this.wellnessForm.valid) {
      const activity = {
        id: Date.now(),
        ...this.wellnessForm.value,
        timestamp: new Date().toISOString()
      };

      this.activities.unshift(activity);
      this.saveActivities();
      this.updateDashboardData(activity);
      
      this.snackBar.open('Activity logged successfully!', 'Close', {
        duration: 3000
      });

      this.wellnessForm.reset({
        date: new Date(),
        activityType: '',
        value: '',
        notes: ''
      });
    }
  }

  updateDashboardData(activity: any) {
    const dashboardData = localStorage.getItem('wellnessData');
    let data = dashboardData ? JSON.parse(dashboardData) : {
      today: { steps: 0, water: 0, sleep: 0, mood: 'neutral' },
      weekly: { steps: [0, 0, 0, 0, 0, 0, 0], water: [0, 0, 0, 0, 0, 0, 0], sleep: [0, 0, 0, 0, 0, 0, 0] }
    };

    const today = new Date().toDateString();
    const activityDate = new Date(activity.date).toDateString();

    if (activityDate === today) {
      switch (activity.activityType) {
        case 'steps':
          data.today.steps += activity.value;
          break;
        case 'water':
          data.today.water += activity.value;
          break;
        case 'sleep':
          data.today.sleep = activity.value;
          break;
        case 'mood':
          data.today.mood = activity.value;
          break;
      }
    }

    localStorage.setItem('wellnessData', JSON.stringify(data));
  }

  deleteActivity(id: number) {
    this.activities = this.activities.filter(activity => activity.id !== id);
    this.saveActivities();
    this.snackBar.open('Activity deleted!', 'Close', {
      duration: 2000
    });
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'steps': 'directions_walk',
      'water': 'water_drop',
      'sleep': 'bedtime',
      'mood': 'sentiment_satisfied'
    };
    return icons[type] || 'fitness_center';
  }

  getActivityUnit(type: string): string {
    const units: { [key: string]: string } = {
      'steps': 'steps',
      'water': 'L',
      'sleep': 'h',
      'mood': ''
    };
    return units[type] || '';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'steps': '#4caf50',
      'water': '#2196f3',
      'sleep': '#9c27b0',
      'mood': '#ff9800'
    };
    return colors[type] || '#666';
  }
}
