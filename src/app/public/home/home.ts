import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { NewsletterService } from '../../core/services/newsletter.service';
import { CartService } from '../../core/services/cart.service';
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
  private readonly cartService = inject(CartService);

  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);

  newsletterEmail = '';
  newsletterMessage = signal<string | null>(null);
  newsletterError = signal<string | null>(null);
  isNewsletterLoading = signal(false);

  isLoading = signal(true);

  constructor() {
    this.loadHomeData();
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

  addToCart(product: Product): void {
    this.cartService.addItem({ productId: product.id!, cantidad: 1 }, product);
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
          this.newsletterError.set(
            error?.error?.message || 'No se pudo registrar la suscripción.'
          );
        },
      });
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }
}