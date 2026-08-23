import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductService, Page } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  
  // Paginación
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 12;

  // Filtros
  selectedCategory = signal<string | null>(null);
  maxPrice = signal<number>(1000); // Rango de precio inicial
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      const category = params['category'] || null;
      this.selectedCategory.set(category);
      this.currentPage.set(0); 
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.categoryService.findAll().subscribe({
      next: (cats) => this.categories.set(cats.filter(c => c.activo)),
      error: () => this.categories.set([])
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    window.scrollTo(0, 0);

    const category = this.selectedCategory() || undefined;

    this.productService.findAll(category, this.currentPage(), this.pageSize).subscribe({
      next: (pageData) => {
        this.products.set(pageData.content);
        this.totalPages.set(pageData.totalPages);
        this.totalElements.set(pageData.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // Filtro visual en el frontend para el precio
  get filteredProducts(): Product[] {
    return this.products().filter(p => p.precio <= this.maxPrice());
  }

  updatePrice(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.maxPrice.set(Number(input.value));
  }

  onCategoryChange(categorySlug: string | null): void {
    this.router.navigate(['/catalog'], { 
      queryParams: categorySlug ? { category: categorySlug } : {} 
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addItem({ productId: product.id!, cantidad: 1 }, product);
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'S/ 0.00';
    return `S/ ${price.toFixed(2)}`;
  }
  
  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}