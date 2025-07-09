import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellnessService, WellnessDay } from '../../services/wellness/wellness.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-water-intake',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './water-intake.component.html',
  styleUrls: ['./water-intake.component.scss']
})
export class WaterIntakeComponent implements OnInit, OnDestroy {
  days: WellnessDay[] = [];
  form: FormGroup;
  waterGoal = 8;
  viewMode: 'table' | 'cards' = 'table';
  private dataSubscription!: Subscription;

  constructor(
    private wellness: WellnessService, 
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      value: ['', [Validators.required, Validators.min(0.1)]]
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
    const goals = await this.wellness.getGoals();
    this.waterGoal = goals.water;
  }

  addWater() {
    if (this.form.valid) {
      this.wellness.addActivity('water', +this.form.value.value);
      this.form.reset();
      // Data will be automatically updated via the subscription
      this.snackBar.open('Water added!', 'Close', { duration: 2000 });
    }
  }

  getTodayWater(): number {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = this.days.find(day => day.date === todayStr);
    return today ? today.water : 0;
  }

  getProgressPercentage(): number {
    const today = this.getTodayWater();
    return Math.min(Math.round((today / this.waterGoal) * 100), 100);
  }

  getProgressAngle(): number {
    const percentage = this.getProgressPercentage();
    return (percentage / 100) * 360;
  }
} 