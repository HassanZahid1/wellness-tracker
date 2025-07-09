import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellnessService, WellnessGoals } from '../../services/wellness/wellness.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  goals: WellnessGoals = { water: 8, exercise: 30, sleep: 8, mood: 3 };
  goalsForm: FormGroup;

  constructor(
    private wellness: WellnessService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.goalsForm = this.fb.group({
      water: [this.goals.water, [Validators.required, Validators.min(1), Validators.max(20)]],
      exercise: [this.goals.exercise, [Validators.required, Validators.min(5), Validators.max(300)]],
      sleep: [this.goals.sleep, [Validators.required, Validators.min(4), Validators.max(16)]],
      mood: [this.goals.mood, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    this.goals = await this.wellness.getGoals();
          this.goalsForm = this.fb.group({
      water: [this.goals.water, [Validators.required, Validators.min(1), Validators.max(20)]],
      exercise: [this.goals.exercise, [Validators.required, Validators.min(5), Validators.max(300)]],
      sleep: [this.goals.sleep, [Validators.required, Validators.min(4), Validators.max(16)]],
      mood: [this.goals.mood, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  saveGoals() {
    if (this.goalsForm.valid) {
      const newGoals: WellnessGoals = {
        water: +this.goalsForm.value.water,
        exercise: +this.goalsForm.value.exercise,
        sleep: +this.goalsForm.value.sleep,
        mood: +this.goalsForm.value.mood
      };
      this.wellness.setGoals(newGoals);
      this.goals = newGoals;
      this.snackBar.open('Goals updated successfully!', 'Close', { duration: 3000 });
    }
  }

  resetToDefaults() {
    const defaultGoals: WellnessGoals = { water: 8, exercise: 30, sleep: 8, mood: 3 };
    this.goalsForm.patchValue(defaultGoals);
    this.goals = defaultGoals;
    this.wellness.setGoals(defaultGoals);
    this.snackBar.open('Reset to default goals!', 'Close', { duration: 3000 });
  }
} 