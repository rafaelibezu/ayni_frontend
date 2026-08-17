import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { NewsletterService } from '../../core/services/newsletter.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { ChatbotComponent } from '../../chatbot/chatbot.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, ChatbotComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly newsletterService = inject(NewsletterService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  favoriteProductIds = signal<Set<number>>(new Set());
  pendingFavoriteIds = signal<Set<number>>(new Set());
  favoriteError = signal<string | null>(null);

  newsletterEmail = '';
  newsletterMessage = signal<string | null>(null);
  newsletterError = signal<string | null>(null);
  isNewsletterLoading = signal(false);

  isLoading = signal(true);

  constructor() {
    this.loadHomeData();
    this.loadFavorites();
  }

  loadFavorites(): void {
    if (!this.authService.isAuthenticated()) return;

    this.favoriteService.findAll().subscribe({
      next: (favorites) =>
        this.favoriteProductIds.set(new Set(favorites.map((item) => item.productId))),
      error: () => this.favoriteProductIds.set(new Set()),
    });
  }

  toggleFavorite(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.isFavoritePending(product.id)) return;

    this.favoriteError.set(null);
    this.setFavoritePending(product.id, true);
    const request: Observable<unknown> = this.isFavorite(product.id)
      ? this.favoriteService.remove(product.id)
      : this.favoriteService.add(product.id);

    request.subscribe({
      next: () => {
        this.favoriteProductIds.update((current) => {
          const updated = new Set(current);
          updated.has(product.id) ? updated.delete(product.id) : updated.add(product.id);
          return updated;
        });
        this.setFavoritePending(product.id, false);
      },
      error: (error: { error?: { message?: string } }) => {
        this.setFavoritePending(product.id, false);
        this.favoriteError.set(
          error?.error?.message || 'No se pudo actualizar tu lista de deseos.',
        );
      },
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProductIds().has(productId);
  }

  isFavoritePending(productId: number): boolean {
    return this.pendingFavoriteIds().has(productId);
  }

  private setFavoritePending(productId: number, pending: boolean): void {
    this.pendingFavoriteIds.update((current) => {
      const updated = new Set(current);
      pending ? updated.add(productId) : updated.delete(productId);
      return updated;
    });
  }

  loadHomeData(): void {
    this.isLoading.set(true);

    this.categoryService.findAll().subscribe({
      next: (categories) => {
        this.categories.set(categories.filter((category) => category.activo));
      },
      error: () => {
        this.categories.set([]);
      },
    });

    this.productService.findFeatured().subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.featuredProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  subscribeNewsletter(): void {
    this.newsletterMessage.set(null);
    this.newsletterError.set(null);

    if (!this.newsletterEmail.trim()) {
      this.newsletterError.set('Ingresa tu correo electrónico.');
      return;
    }

    this.isNewsletterLoading.set(true);

    this.newsletterService
      .subscribe({
        email: this.newsletterEmail.trim(),
        nombres: 'Cliente Ayni',
      })
      .subscribe({
        next: () => {
          this.isNewsletterLoading.set(false);
          this.newsletterEmail = '';
          this.newsletterMessage.set('Te suscribiste correctamente. Revisa tu correo.');
        },
        error: (error) => {
          this.isNewsletterLoading.set(false);
          this.newsletterError.set(error?.error?.message || 'No se pudo registrar la suscripción.');
        },
      });
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }
}
