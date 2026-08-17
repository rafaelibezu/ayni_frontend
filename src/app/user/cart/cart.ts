import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Cart as CartModel, CartItem } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);

  cart = signal<CartModel | null>(null);
  isLoading = signal(true);
  updatingItemIds = signal<Set<number>>(new Set());
  isClearing = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.cartService
      .findMyCart()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (cart) => this.cart.set(cart),
        error: (error) => this.showError(error, 'No se pudo cargar tu carrito.'),
      });
  }

  changeQuantity(item: CartItem, change: number): void {
    const cantidad = item.cantidad + change;
    if (cantidad < 1 || cantidad > item.stock || this.isUpdating(item.itemId)) return;

    this.setUpdating(item.itemId, true);
    this.feedback.set(null);
    this.cartService
      .updateItem(item.itemId, cantidad)
      .pipe(finalize(() => this.setUpdating(item.itemId, false)))
      .subscribe({
        next: (cart) => this.cart.set(cart),
        error: (error) => this.showError(error, 'No se pudo actualizar la cantidad.'),
      });
  }

  removeItem(item: CartItem): void {
    if (this.isUpdating(item.itemId)) return;
    this.setUpdating(item.itemId, true);
    this.feedback.set(null);
    this.cartService
      .removeItem(item.itemId)
      .pipe(finalize(() => this.setUpdating(item.itemId, false)))
      .subscribe({
        next: (cart) => {
          this.cart.set(cart);
          this.feedback.set({ type: 'success', text: `${item.nombre} fue eliminado del carrito.` });
        },
        error: (error) => this.showError(error, 'No se pudo eliminar el producto.'),
      });
  }

  clearCart(): void {
    if (!this.cart()?.items.length || !window.confirm('¿Deseas vaciar todo el carrito?')) return;
    this.isClearing.set(true);
    this.feedback.set(null);
    this.cartService
      .clear()
      .pipe(finalize(() => this.isClearing.set(false)))
      .subscribe({
        next: () => {
          this.cart.update((cart) =>
            cart ? { ...cart, items: [], totalItems: 0, subtotal: 0 } : null,
          );
          this.feedback.set({ type: 'success', text: 'El carrito quedó vacío.' });
        },
        error: (error) => this.showError(error, 'No se pudo vaciar el carrito.'),
      });
  }

  isUpdating(itemId: number): boolean {
    return this.updatingItemIds().has(itemId);
  }
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  }

  private setUpdating(itemId: number, updating: boolean): void {
    this.updatingItemIds.update((current) => {
      const updated = new Set(current);
      updating ? updated.add(itemId) : updated.delete(itemId);
      return updated;
    });
  }

  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
