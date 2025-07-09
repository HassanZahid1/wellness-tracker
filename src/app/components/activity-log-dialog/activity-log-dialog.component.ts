import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators   } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WellnessService } from '../../services/wellness/wellness.service';

export interface WellnessActivity {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-activity-log-dialog',
  standalone: true,
  templateUrl: './activity-log-dialog.component.html',
  styleUrl: './activity-log-dialog.component.scss',
  imports: [CommonModule, MatButtonModule, FormsModule, MatSliderModule, ReactiveFormsModule]
})
export class ActivityLogDialogComponent {
  activityForm: FormGroup;
  selectedActivity: string = 'water';
  waterQuantity: number = 1; // Changed to glasses
  exerciseQuantity: number = 15; // Minutes
  sleepQuantity: number = 8; // Hours
  moodQuantity: number = 3; // Rating 1-5
  dailyWaterIntake: number = 0;
  dailyExerciseIntake: number = 0;
  dailySleepIntake: number = 0;
  dailyMoodIntake: number = 0;
  dailyWaterGoal: number = 8; // Changed to glasses
  dailyExerciseGoal: number = 30; // Minutes
  dailySleepGoal: number = 8; // Hours

  activities: WellnessActivity[] = [
    { id: 'water', name: 'Water', icon: '💧' },
    { id: 'exercise', name: 'Exercise', icon: '🏃‍♂️' },
    { id: 'sleep', name: 'Sleep', icon: '😴' },
    { id: 'mood', name: 'Mood', icon: '😊' }
  ];

  moodOptions = [
    { value: 1, label: '😢 Very Bad', color: '#f44336' },
    { value: 2, label: '😕 Bad', color: '#ff9800' },
    { value: 3, label: '😐 Okay', color: '#ffc107' },
    { value: 4, label: '🙂 Good', color: '#4caf50' },
    { value: 5, label: '😄 Excellent', color: '#2196f3' }
  ];

  constructor(
    private fb: FormBuilder,
    private wellnessService: WellnessService,
    private dialogRef: MatDialogRef<ActivityLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.activityForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      quantity: [this.waterQuantity, [Validators.required, Validators.min(0.1)]]
    });
    
    this.loadCurrentData();
  }

  ngOnInit(): void {
    // Initialize with current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    this.activityForm.patchValue({
      date: currentDate,
      time: currentTime
    });
  }

  private async loadCurrentData(): Promise<void> {
    // Load current data for today
    const days = await this.wellnessService.getDays();
    const today = days[days.length - 1]; // Get today's data
    this.dailyWaterIntake = today.water;
    this.dailyExerciseIntake = today.exercise;
    this.dailySleepIntake = today.sleep;
    this.dailyMoodIntake = today.mood;
    
    // Load goals
    const goals = await this.wellnessService.getGoals();
    this.dailyWaterGoal = goals.water; // Now in glasses
    this.dailyExerciseGoal = goals.exercise; // Minutes
    this.dailySleepGoal = goals.sleep; // Hours
  }

  selectActivity(activityId: string): void {
    this.selectedActivity = activityId;
    
    // Update form validation and default values based on selected activity
    if (activityId === 'water') {
      this.activityForm.patchValue({ quantity: this.waterQuantity });
      this.activityForm.get('quantity')?.setValidators([Validators.required, Validators.min(0.1)]);
    } else if (activityId === 'exercise') {
      this.activityForm.patchValue({ quantity: this.exerciseQuantity });
      this.activityForm.get('quantity')?.setValidators([Validators.required, Validators.min(1)]);
    } else if (activityId === 'sleep') {
      this.activityForm.patchValue({ quantity: this.sleepQuantity });
      this.activityForm.get('quantity')?.setValidators([Validators.required, Validators.min(0.5), Validators.max(24)]);
    } else if (activityId === 'mood') {
      this.activityForm.patchValue({ quantity: this.moodQuantity });
      this.activityForm.get('quantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(5)]);
    }
    
    this.activityForm.get('quantity')?.updateValueAndValidity();
  }

  updateWaterQuantity(amount: number): void {
    this.waterQuantity = Math.max(0.1, Math.min(5, amount));
    this.activityForm.patchValue({ quantity: this.waterQuantity });
  }

  updateExerciseQuantity(amount: number): void {
    this.exerciseQuantity = Math.max(1, Math.min(120, amount));
    this.activityForm.patchValue({ quantity: this.exerciseQuantity });
  }

  updateSleepQuantity(amount: number): void {
    this.sleepQuantity = Math.max(0.5, Math.min(24, amount));
    this.activityForm.patchValue({ quantity: this.sleepQuantity });
  }

  updateMoodQuantity(amount: number): void {
    this.moodQuantity = Math.max(1, Math.min(5, amount));
    this.activityForm.patchValue({ quantity: this.moodQuantity });
  }

  addWaterAmount(amount: number): void {
    this.updateWaterQuantity(this.waterQuantity + amount);
  }

  addExerciseAmount(amount: number): void {
    this.updateExerciseQuantity(this.exerciseQuantity + amount);
  }

  addSleepAmount(amount: number): void {
    this.updateSleepQuantity(this.sleepQuantity + amount);
  }

  selectMood(rating: number): void {
    this.updateMoodQuantity(rating);
  }

  getWaterIntakePercentage(): number {
    return Math.round((this.dailyWaterIntake / this.dailyWaterGoal) * 100);
  }

  getExerciseIntakePercentage(): number {
    return Math.round((this.dailyExerciseIntake / this.dailyExerciseGoal) * 100);
  }

  getSleepIntakePercentage(): number {
    return Math.round((this.dailySleepIntake / this.dailySleepGoal) * 100);
  }

  getWaterProgressBarWidth(): number {
    return Math.min((this.dailyWaterIntake / this.dailyWaterGoal) * 100, 100);
  }

  getExerciseProgressBarWidth(): number {
    return Math.min((this.dailyExerciseIntake / this.dailyExerciseGoal) * 100, 100);
  }

  getSleepProgressBarWidth(): number {
    return Math.min((this.dailySleepIntake / this.dailySleepGoal) * 100, 100);
  }

  getMoodLabel(rating: number): string {
    const mood = this.moodOptions.find(m => m.value === rating);
    return mood ? mood.label : 'Not set';
  }

  getMoodColor(rating: number): string {
    const mood = this.moodOptions.find(m => m.value === rating);
    return mood ? mood.color : '#ccc';
  }

  onSaveLog(): void {
    if (this.activityForm.valid) {
      const formData = this.activityForm.value;
      const logEntry = {
        activity: this.selectedActivity,
        quantity: formData.quantity,
        date: formData.date,
        time: formData.time
      };
      
      // Save to wellness service based on activity type
      switch (this.selectedActivity) {
        case 'water':
          this.wellnessService.addActivity('water', formData.quantity);
          break;
        case 'exercise':
          this.wellnessService.addActivity('exercise', formData.quantity);
          break;
        case 'sleep':
          this.wellnessService.setSleep(formData.quantity);
          break;
        case 'mood':
          this.wellnessService.setMood(formData.quantity);
          break;
      }
      
      // Close dialog and return the log entry
      this.dialogRef.close(logEntry);
    }
  }

  private resetForm(): void {
    this.waterQuantity = 1; // Reset to 1 glass
    this.exerciseQuantity = 15; // Reset to 15 minutes
    this.sleepQuantity = 8; // Reset to 8 hours
    this.moodQuantity = 3; // Reset to neutral mood
    this.activityForm.patchValue({ quantity: this.waterQuantity });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSliderChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = +input.value;
    
    if (this.selectedActivity === 'water') {
      this.waterQuantity = value;
      this.activityForm.patchValue({ quantity: this.waterQuantity });
    } else if (this.selectedActivity === 'exercise') {
      this.exerciseQuantity = value;
      this.activityForm.patchValue({ quantity: this.exerciseQuantity });
    } else if (this.selectedActivity === 'sleep') {
      this.sleepQuantity = value;
      this.activityForm.patchValue({ quantity: this.sleepQuantity });
    }
  }
  
}
