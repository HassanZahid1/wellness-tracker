import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'wellness-log', 
    loadComponent: () => import('./components/wellness-log/wellness-log.component').then(m => m.WellnessLogComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'reminders', 
    loadComponent: () => import('./components/reminder-settings/reminder-settings.component').then(m => m.ReminderSettingsComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'water',
    loadComponent: () => import('./components/water-intake/water-intake.component').then(m => m.WaterIntakeComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'exercise',
    loadComponent: () => import('./components/exercise/exercise.component').then(m => m.ExerciseComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'sleep',
    loadComponent: () => import('./components/sleep/sleep.component').then(m => m.SleepComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'mood',
    loadComponent: () => import('./components/mood/mood.component').then(m => m.MoodComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
