import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminProduct,
  AdminProductRequest,
} from '../../core/models/admin-product.model';
import { Category } from '../../core/models/category.model';
import { AdminProductService } from '../../core/services/admin-product.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly productService = inject(AdminProductService);
  private readonly categoryService = inject(CategoryService);

  products = signal<AdminProduct[]>([]);
  categories = signal<Category[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  searchTerm = signal('');
  categoryFilter = signal<string>('ALL');
  statusFilter = signal<string>('ALL');
  featuredFilter = signal<string>('ALL');
  stockFilter = signal<string>('ALL');

  isModalOpen = signal(false);
  editingProduct = signal<AdminProduct | null>(null);

  form: AdminProductRequest = this.emptyForm();

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.findAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar los productos.'
        );
        this.isLoading.set(false);
      },
    });

    this.categoryService.findAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  get filteredProducts(): AdminProduct[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.products().filter((product) => {
      const matchesSearch =
        !search ||
        product.nombre.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.categoriaNombre.toLowerCase().includes(search);

      const matchesCategory =
        this.categoryFilter() === 'ALL' ||
        product.categoriaSlug === this.categoryFilter();

      const matchesStatus =
        this.statusFilter() === 'ALL' ||
        (this.statusFilter() === 'ACTIVE' && product.activo) ||
        (this.statusFilter() === 'INACTIVE' && !product.activo);

      const matchesFeatured =
        this.featuredFilter() === 'ALL' ||
        (this.featuredFilter() === 'YES' && product.destacado) ||
        (this.featuredFilter() === 'NO' && !product.destacado);

      const matchesStock =
        this.stockFilter() === 'ALL' ||
        (this.stockFilter() === 'LOW' && product.stock > 0 && product.stock <= 5) ||
        (this.stockFilter() === 'OUT' && product.stock <= 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesStock
      );
    });
  }

  get totalProducts(): number {
    return this.products().length;
  }

  get activeProducts(): number {
    return this.products().filter((product) => product.activo).length;
  }

  get lowStockProducts(): number {
    return this.products().filter((product) => product.stock > 0 && product.stock <= 5).length;
  }

  get featuredProducts(): number {
    return this.products().filter((product) => product.destacado).length;
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.form = this.emptyForm();
    this.isModalOpen.set(true);
  }

  openEditModal(product: AdminProduct): void {
    this.editingProduct.set(product);

    this.form = {
      categoriaId: product.categoriaId,
      nombre: product.nombre,
      sku: product.sku,
      descripcion: product.descripcion,
      precio: product.precio,
      precioComparacion: product.precioComparacion,
      stock: product.stock,
      imagenPrincipalUrl: product.imagenPrincipalUrl,
      badge: product.badge,
      destacado: product.destacado,
      activo: product.activo,
    };

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
    this.form = this.emptyForm();
  }

  saveProduct(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (!this.form.nombre.trim() || !this.form.sku.trim() || !this.form.categoriaId) {
      this.errorMessage.set('Nombre, SKU y categoría son obligatorios.');
      return;
    }

    this.isSaving.set(true);

    const product = this.editingProduct();

    const request: AdminProductRequest = {
      ...this.form,
      nombre: this.form.nombre.trim(),
      sku: this.form.sku.trim(),
      descripcion: this.form.descripcion.trim(),
      imagenPrincipalUrl: this.form.imagenPrincipalUrl?.trim() || null,
      badge: this.form.badge?.trim() || null,
      precioComparacion: this.form.precioComparacion || null,
    };

    const operation = product
      ? this.productService.update(product.id, request)
      : this.productService.create(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(
          product ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.'
        );
        this.closeModal();
        this.loadData();
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo guardar el producto.'
        );
      },
    });
  }

  toggleStatus(product: AdminProduct): void {
    this.productService.toggleStatus(product.id).subscribe({
      next: () => {
        this.successMessage.set(
          product.activo ? 'Producto desactivado correctamente.' : 'Producto activado correctamente.'
        );
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cambiar el estado del producto.'
        );
      },
    });
  }

  updateStock(product: AdminProduct): void {
    const value = prompt(`Nuevo stock para ${product.nombre}:`, String(product.stock));

    if (value === null) {
      return;
    }

    const stock = Number(value);

    if (Number.isNaN(stock) || stock < 0) {
      this.errorMessage.set('Ingresa un stock válido.');
      return;
    }

    this.productService.updateStock(product.id, stock).subscribe({
      next: () => {
        this.successMessage.set('Stock actualizado correctamente.');
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'No se pudo actualizar el stock.'
        );
      },
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('ALL');
    this.statusFilter.set('ALL');
    this.featuredFilter.set('ALL');
    this.stockFilter.set('ALL');
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value || 0);
  }

  stockClass(product: AdminProduct): string {
    if (product.stock <= 0) {
      return 'stock-out';
    }

    if (product.stock <= 5) {
      return 'stock-low';
    }

    return 'stock-ok';
  }

  private emptyForm(): AdminProductRequest {
    return {
      categoriaId: 0,
      nombre: '',
      sku: '',
      descripcion: '',
      precio: 0,
      precioComparacion: null,
      stock: 0,
      imagenPrincipalUrl: null,
      badge: null,
      destacado: false,
      activo: true,
    };
  }
}