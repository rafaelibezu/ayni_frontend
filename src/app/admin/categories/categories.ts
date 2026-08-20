import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminCategory,
  AdminCategoryRequest,
} from '../../core/models/admin-category.model';
import { AdminCategoryService } from '../../core/services/admin-category.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private readonly categoryService = inject(AdminCategoryService);

  categories = signal<AdminCategory[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  isModalOpen = signal(false);
  editingCategory = signal<AdminCategory | null>(null);

  form: AdminCategoryRequest = this.emptyForm();

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoryService.findAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.categories.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar las categorías.'
        );
      },
    });
  }

  get filteredCategories(): AdminCategory[] {
    const search = this.searchTerm().trim().toLowerCase();

    return this.categories().filter((category) => {
      const matchesSearch =
        !search ||
        category.nombre.toLowerCase().includes(search) ||
        category.slug.toLowerCase().includes(search) ||
        category.descripcion?.toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter() === 'ALL' ||
        (this.statusFilter() === 'ACTIVE' && category.activo) ||
        (this.statusFilter() === 'INACTIVE' && !category.activo);

      return matchesSearch && matchesStatus;
    });
  }

  get totalCategories(): number {
    return this.categories().length;
  }

  get activeCategories(): number {
    return this.categories().filter((category) => category.activo).length;
  }

  get inactiveCategories(): number {
    return this.categories().filter((category) => !category.activo).length;
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.form = this.emptyForm();
    this.isModalOpen.set(true);
  }

  openEditModal(category: AdminCategory): void {
    this.editingCategory.set(category);

    this.form = {
      nombre: category.nombre,
      descripcion: category.descripcion,
      imagenUrl: category.imagenUrl,
      activo: category.activo,
    };

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCategory.set(null);
    this.form = this.emptyForm();
  }

  saveCategory(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (!this.form.nombre.trim()) {
      this.errorMessage.set('El nombre de la categoría es obligatorio.');
      return;
    }

    this.isSaving.set(true);

    const category = this.editingCategory();

    const request: AdminCategoryRequest = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion?.trim() || null,
      imagenUrl: this.form.imagenUrl?.trim() || null,
      activo: this.form.activo,
    };

    const operation = category
      ? this.categoryService.update(category.id, request)
      : this.categoryService.create(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(
          category
            ? 'Categoría actualizada correctamente.'
            : 'Categoría creada correctamente.'
        );

        this.closeModal();
        this.loadCategories();
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo guardar la categoría.'
        );
      },
    });
  }

  toggleStatus(category: AdminCategory): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.categoryService.toggleStatus(category.id).subscribe({
      next: () => {
        this.successMessage.set(
          category.activo
            ? 'Categoría desactivada correctamente.'
            : 'Categoría activada correctamente.'
        );

        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cambiar el estado de la categoría.'
        );
      },
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private emptyForm(): AdminCategoryRequest {
    return {
      nombre: '',
      descripcion: null,
      imagenUrl: null,
      activo: true,
    };
  }
}