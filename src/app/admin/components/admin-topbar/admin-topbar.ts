import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-topbar',
  imports: [],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.scss',
})
export class AdminTopbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get adminName(): string {
    return this.authService.currentUser()?.nombres || 'Admin Ayni';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}