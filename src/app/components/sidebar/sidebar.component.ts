import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navLinks = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Water Intake', icon: 'local_drink', route: '/water' },
    { label: 'Exercise', icon: 'fitness_center', route: '/exercise' },
    { label: 'Sleep', icon: 'bedtime', route: '/sleep' },
    { label: 'Mood', icon: 'sentiment_satisfied', route: '/mood' },
    { label: 'Reminders', icon: 'notifications', route: '/reminders' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  user$: Observable<User | null>;

  constructor(private auth: AuthService, private router: Router) {
    this.user$ = this.auth.user$;
  }

  async logout() {
    await this.auth.signOut();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
} 