import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexFill,
  ApexYAxis,
  ApexGrid
} from 'ng-apexcharts';
import { WellnessService, WellnessDay } from '../../services/wellness/wellness.service';
import { ActivityLogDialogComponent } from '../activity-log-dialog/activity-log-dialog.component';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  fill: ApexFill;
  yaxis: ApexYAxis;
  grid: ApexGrid;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgApexchartsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  water = 0;
  exercise = 0;
  sleep = 0;
  mood = 0;
  waterGoal = 8;
  exerciseGoal = 30;
  sleepGoal = 8;
  weekly: WellnessDay[] = [];
  private dataSubscription!: Subscription;
  userName: string = '';

  moodOptions = [
    { value: 1, label: '😢 Very Bad', emoji: '😢' },
    { value: 2, label: '😕 Bad', emoji: '😕' },
    { value: 3, label: '😐 Okay', emoji: '😐' },
    { value: 4, label: '🙂 Good', emoji: '🙂' },
    { value: 5, label: '😄 Excellent', emoji: '😄' }
  ];

  public chartOptions: Partial<ChartOptions> = {
    series: [
      { name: 'Water', data: [] },
      { name: 'Exercise', data: [] },
      { name: 'Sleep', data: [] },
      { name: 'Mood', data: [] }
    ],
    chart: { type: 'bar', height: 260, toolbar: { show: false }, sparkline: { enabled: false } },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#b0b3c7', fontWeight: 600 } } },
    yaxis: { labels: { style: { colors: '#b0b3c7', fontWeight: 600 } }, min: 0, max: 10, tickAmount: 5 },
    dataLabels: { enabled: false },
    title: { text: undefined },
    stroke: { show: true, width: 0, colors: ['transparent'] },
    fill: { opacity: 1, colors: ['#4285f4', '#34a853', '#ff6b35', '#2196f3'] },
    grid: { show: true, borderColor: '#f0f1fa', strokeDashArray: 4 }
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private wellness: WellnessService,
    private auth: AuthService
  ) {
    this.loadUser();
    this.loadData();
  }

  ngOnInit(): void {
    this.dataSubscription = this.wellness.dataChanged$.subscribe(() => {
      this.loadData();
    });
    this.loadUser();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  async loadUser() {
    this.auth.user$.subscribe(user => {
      this.userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    });
  }

  async loadData() {
    this.weekly = await this.wellness.getDays();
    const goals = await this.wellness.getGoals();
    this.waterGoal = goals.water;
    this.exerciseGoal = goals.exercise;
    this.sleepGoal = goals.sleep;
    const today = this.weekly[this.weekly.length - 1];
    this.water = today.water;
    this.exercise = today.exercise;
    this.sleep = today.sleep;
    this.mood = today.mood;
    this.updateChart();
  }

  // Calculate progress percentage (capped at 100%)
  getWaterProgress(): number {
    return Math.min((this.water / this.waterGoal) * 100, 100);
  }

  getExerciseProgress(): number {
    return Math.min((this.exercise / this.exerciseGoal) * 100, 100);
  }

  getSleepProgress(): number {
    return Math.min((this.sleep / this.sleepGoal) * 100, 100);
  }

  getMoodProgress(): number {
    return this.mood > 0 ? (this.mood / 5) * 100 : 0;
  }

  getMoodEmoji(rating: number): string {
    const mood = this.moodOptions.find(m => m.value === rating);
    return mood ? mood.emoji : '😐';
  }

  getMoodLabel(rating: number): string {
    const mood = this.moodOptions.find(m => m.value === rating);
    return mood ? mood.label.split(' ').slice(1).join(' ') : 'Not set';
  }

  updateChart() {
    const days = this.weekly;
    const dayNames = days.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    this.chartOptions = {
      ...this.chartOptions,
      xaxis: { ...this.chartOptions.xaxis, categories: dayNames },
      series: [
        { name: 'Water', data: days.map(d => d.water) },
        { name: 'Exercise', data: days.map(d => d.exercise / 10) }, // Scale down exercise to fit chart
        { name: 'Sleep', data: days.map(d => d.sleep) },
        { name: 'Mood', data: days.map(d => d.mood) }
      ]
    };
  }

  openLogDialog() {
    const dialogRef = this.dialog.open(ActivityLogDialogComponent, {
      width: '500px',
      panelClass: 'wellness-log-dialog',
      data: {} // Pass any data if needed
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Logged Entry:', result);
        this.snackBar.open('Wellness activity logged successfully!', 'Close', { duration: 3000 });
        // Data will be automatically updated via the subscription
      }
    });
  }

}
