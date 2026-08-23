import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';

import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly favoriteService = inject(FavoriteService);

  product = signal<Product | null>(null);
  recommendedProducts = signal<Product[]>([]);
  isLoading = signal(true);
  isFavorite = signal(false);
  isFavoritePending = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  
  quantity = signal(1);
  activeTab = signal<'beneficios' | 'ingredientes' | 'uso'>('beneficios');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });

    this.productService.findFeatured().subscribe({
      next: (products) => this.recommendedProducts.set(products.slice(0, 4)),
    });
  }

  loadProduct(slug: string): void {
    this.isLoading.set(true);
    this.feedback.set(null);
    window.scrollTo(0, 0);

    this.productService.findBySlug(slug).subscribe({
      next: (data) => {
        this.product.set(data);
        this.quantity.set(1);
        this.isFavorite.set(false);
        this.loadFavoriteState(data.id);
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isFavorite.set(false);
        this.isLoading.set(false);
      },
    });
  }

  increaseQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  decreaseQuantity(): void {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.cartService.addItem(
        { productId: currentProduct.id!, cantidad: this.quantity() },
        currentProduct
      );
    }
  }

  toggleFavorite(): void {
    const currentProduct = this.product();

    if (!currentProduct || this.isFavoritePending()) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isFavoritePending.set(true);
    this.feedback.set(null);

    const request$: Observable<unknown> = this.isFavorite()
      ? this.favoriteService.remove(currentProduct.id)
      : this.favoriteService.add(currentProduct.id);

    request$.pipe(finalize(() => this.isFavoritePending.set(false))).subscribe({
      next: () => {
        const saved = !this.isFavorite();
        this.isFavorite.set(saved);
        this.feedback.set({
          type: 'success',
          text: saved
            ? `${currentProduct.nombre} se agrego a tus favoritos.`
            : `${currentProduct.nombre} se elimino de tus favoritos.`,
        });
      },
      error: (error) => this.showError(error, 'No se pudo actualizar tus favoritos.'),
    });
  }

  setTab(tab: 'beneficios' | 'ingredientes' | 'uso'): void {
    this.activeTab.set(tab);
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'S/ 0.00';
    return `S/ ${price.toFixed(2)}`;
  }

  private loadFavoriteState(productId: number): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.favoriteService.findAll().subscribe({
      next: (favorites) => {
        this.isFavorite.set(favorites.some((favorite) => favorite.productId === productId));
      },
      error: () => this.isFavorite.set(false),
    });
  }

  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
