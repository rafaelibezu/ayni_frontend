import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Favorite } from '../../core/models/favorite.model';
import { UserProfile } from '../../core/models/user.model';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {
  private readonly favoriteService = inject(FavoriteService);
  private readonly cartService = inject(CartService);
  private readonly userService = inject(UserService);

  user = signal<UserProfile | null>(null);
  favorites = signal<Favorite[]>([]);
  isLoading = signal(true);
  removingProductId = signal<number | null>(null);
  addingProductId = signal<number | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor() {
    this.loadUser();
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.favoriteService
      .findAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (favorites) => this.favorites.set(favorites),
        error: (error) => this.showError(error, 'No se pudo cargar tu lista de deseos.'),
      });
  }

  remove(favorite: Favorite): void {
    this.removingProductId.set(favorite.productId);
    this.feedback.set(null);
    this.favoriteService
      .remove(favorite.productId)
      .pipe(finalize(() => this.removingProductId.set(null)))
      .subscribe({
        next: () => {
          this.favorites.update((items) =>
            items.filter((item) => item.productId !== favorite.productId),
          );
          this.feedback.set({
            type: 'success',
            text: `${favorite.nombreProducto} fue eliminado de tu lista.`,
          });
        },
        error: (error) => this.showError(error, 'No se pudo eliminar el producto.'),
      });
  }

  addToCart(favorite: Favorite): void {
    if (!this.hasStock(favorite)) return;
    this.addingProductId.set(favorite.productId);
    this.feedback.set(null);
    this.cartService
      .addItem({ productId: favorite.productId, cantidad: 1 })
      .pipe(finalize(() => this.addingProductId.set(null)))
      .subscribe({
        next: () =>
          this.feedback.set({
            type: 'success',
            text: `${favorite.nombreProducto} se agregó al carrito.`,
          }),
        error: (error) => this.showError(error, 'No se pudo agregar el producto al carrito.'),
      });
  }

  hasStock(favorite: Favorite): boolean {
    return favorite.stock === null || favorite.stock > 0;
  }
  isLowStock(favorite: Favorite): boolean {
    return favorite.stock !== null && favorite.stock > 0 && favorite.stock <= 5;
  }
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  }

  private loadUser(): void {
    this.userService
      .getMe()
      .subscribe({ next: (user) => this.user.set(user), error: () => this.user.set(null) });
  }

  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
