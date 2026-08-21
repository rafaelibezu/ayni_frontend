import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminUser,
  CreateAdminUserRequest,
} from '../../core/models/admin-user.model';
import { AdminUserService } from '../../core/services/admin-user.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly userService = inject(AdminUserService);

  users = signal<AdminUser[]>([]);
  selectedUser = signal<AdminUser | null>(null);

  isLoading = signal(true);
  isSaving = signal(false);
  isDetailLoading = signal(false);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  roleFilter = signal<'ALL' | 'ADMIN' | 'USER'>('ALL');

  isModalOpen = signal(false);

  form: CreateAdminUserRequest = this.emptyForm();

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.findAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.users.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar los usuarios.'
        );
      },
    });
  }

  get filteredUsers(): AdminUser[] {
    const search = this.searchTerm().trim().toLowerCase();

    return this.users().filter((user) => {
      const fullName = `${user.nombres} ${user.apellidos}`.toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.celular?.includes(search);

      const matchesStatus =
        this.statusFilter() === 'ALL' ||
        (this.statusFilter() === 'ACTIVE' && user.activo) ||
        (this.statusFilter() === 'INACTIVE' && !user.activo);

      const matchesRole =
        this.roleFilter() === 'ALL' || user.roles.includes(this.roleFilter());

      return matchesSearch && matchesStatus && matchesRole;
    });
  }

  get totalUsers(): number {
    return this.users().length;
  }

  get activeUsers(): number {
    return this.users().filter((user) => user.activo).length;
  }

  get adminUsers(): number {
    return this.users().filter((user) => user.roles.includes('ADMIN')).length;
  }

  get clientUsers(): number {
    return this.users().filter((user) => user.roles.includes('USER')).length;
  }

  openCreateModal(): void {
    this.form = this.emptyForm();
    this.isModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.form = this.emptyForm();
    this.isModalOpen.set(false);
  }

  createAdmin(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (
      !this.form.nombres.trim() ||
      !this.form.apellidos.trim() ||
      !this.form.email.trim() ||
      !this.form.password.trim()
    ) {
      this.errorMessage.set('Nombres, apellidos, correo y contraseña son obligatorios.');
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isSaving.set(true);

    const request: CreateAdminUserRequest = {
      nombres: this.form.nombres.trim(),
      apellidos: this.form.apellidos.trim(),
      email: this.form.email.trim(),
      password: this.form.password,
      celular: this.form.celular?.trim() || null,
    };

    this.userService.createAdmin(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Administrador creado correctamente.');
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo crear el administrador.'
        );
      },
    });
  }

  openDetail(userId: number): void {
    this.isDetailLoading.set(true);
    this.selectedUser.set(null);

    this.userService.findById(userId).subscribe({
      next: (user) => {
        this.selectedUser.set(user);
        this.isDetailLoading.set(false);
      },
      error: (error) => {
        this.isDetailLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cargar el detalle del usuario.'
        );
      },
    });
  }

  closeDetail(): void {
    this.selectedUser.set(null);
  }

  toggleStatus(user: AdminUser): void {
    const confirmed = window.confirm(
      user.activo
        ? `¿Deseas desactivar a ${user.nombres} ${user.apellidos}?`
        : `¿Deseas activar a ${user.nombres} ${user.apellidos}?`
    );

    if (!confirmed) {
      return;
    }

    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.userService.toggleStatus(user.id).subscribe({
      next: () => {
        this.successMessage.set(
          user.activo
            ? 'Usuario desactivado correctamente.'
            : 'Usuario activado correctamente.'
        );

        this.loadUsers();

        const selected = this.selectedUser();
        if (selected?.id === user.id) {
          this.closeDetail();
        }
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cambiar el estado del usuario.'
        );
      },
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
    this.roleFilter.set('ALL');
  }

  fullName(user: AdminUser | null): string {
    if (!user) {
      return '-';
    }

    return `${user.nombres} ${user.apellidos}`;
  }

  initials(user: AdminUser): string {
    const first = user.nombres?.charAt(0) || '';
    const last = user.apellidos?.charAt(0) || '';

    return `${first}${last}`.toUpperCase();
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

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      USER: 'Cliente',
    };

    return labels[role] || role;
  }

  private emptyForm(): CreateAdminUserRequest {
    return {
      nombres: '',
      apellidos: '',
      email: '',
      password: '',
      celular: null,
    };
  }
}