import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { BadgeComponent } from '../../components/ui/badge/badge.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardContentComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit, OnDestroy {
  isLoggingOut = false;
  loggedOut = false;
  countdown = 10;
  currentDate = '';
  currentTime = '';

  private logoutTimer?: number;
  private countdownTimer?: number;

  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString();
    this.currentTime = new Date().toLocaleTimeString();

    // Simulate logout process
    this.logoutTimer = window.setTimeout(() => {
      this.isLoggingOut = true;

      // Simulate logout API call
      setTimeout(() => {
        this.isLoggingOut = false;
        this.loggedOut = true;

        this.toastService.success(
          'Successfully Logged Out',
          'Your session has been ended securely',
        );

        // Start countdown for redirect
        this.countdownTimer = window.setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            this.router.navigate(['/']);
          }
        }, 1000);
      }, 2000);
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  getBackgroundGradient(): string {
    return 'linear-gradient(135deg, #D8E9F6 0%, #B0D2EC 50%, #89BCE3 100%)';
  }
}
