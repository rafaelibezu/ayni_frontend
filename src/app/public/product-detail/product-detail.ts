import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  product = signal<Product | null>(null);
  recommendedProducts = signal<Product[]>([]);
  isLoading = signal(true);
  
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
    window.scrollTo(0, 0);

    this.productService.findBySlug(slug).subscribe({
      next: (data) => {
        this.product.set(data);
        this.quantity.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
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

  setTab(tab: 'beneficios' | 'ingredientes' | 'uso'): void {
    this.activeTab.set(tab);
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'S/ 0.00';
    return `S/ ${price.toFixed(2)}`;
  }
}