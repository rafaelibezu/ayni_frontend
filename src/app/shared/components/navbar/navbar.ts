import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  isUserMenuOpen = signal(false);

  // Esta señal reactiva escucha el total de items en el carrito en tiempo real
  cartItemCount = computed(() => this.cartService.cart()?.totalItems || 0);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get userName(): string {
    const user = this.authService.currentUser();

    if (!user) {
      return '';
    }

    return user.nombres;
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen.update((value) => !value);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeUserMenu();
  }
}