import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminPayment,
  AdminPaymentStatus,
} from '../../core/models/admin-payment.model';
import { AdminPaymentService } from '../../core/services/admin-payment.service';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly paymentService = inject(AdminPaymentService);

  payments = signal<AdminPayment[]>([]);
  selectedPayment = signal<AdminPayment | null>(null);

  isLoading = signal(true);
  isUpdating = signal(false);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  statusFilter = signal<'ALL' | AdminPaymentStatus>('ALL');

  newStatus = signal<AdminPaymentStatus>('VALIDADO');
  observation = signal('');

  readonly statuses: AdminPaymentStatus[] = [
    'PENDIENTE',
    'EN_REVISION',
    'VALIDADO',
    'RECHAZADO',
    'FALLIDO',
  ];

  constructor() {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.paymentService.findAll().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.payments.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar los pagos Yape.'
        );
      },
    });
  }

  get filteredPayments(): AdminPayment[] {
    const search = this.searchTerm().trim().toLowerCase();

    return this.payments().filter((payment) => {
      const matchesSearch =
        !search ||
        payment.codigoPedido.toLowerCase().includes(search) ||
        payment.clienteNombre.toLowerCase().includes(search) ||
        payment.clienteEmail?.toLowerCase().includes(search) ||
        payment.numeroOperacion?.toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter() === 'ALL' || payment.estado === this.statusFilter();

      return matchesSearch && matchesStatus;
    });
  }

  get totalPayments(): number {
    return this.payments().length;
  }

  get reviewPayments(): number {
    return this.payments().filter((payment) => payment.estado === 'EN_REVISION').length;
  }

  get validatedPayments(): number {
    return this.payments().filter((payment) => payment.estado === 'VALIDADO').length;
  }

  get rejectedPayments(): number {
    return this.payments().filter(
      (payment) => payment.estado === 'RECHAZADO' || payment.estado === 'FALLIDO'
    ).length;
  }

  openDetail(payment: AdminPayment): void {
    this.selectedPayment.set(payment);

    if (payment.estado === 'EN_REVISION' || payment.estado === 'PENDIENTE') {
      this.newStatus.set('VALIDADO');
    } else {
      this.newStatus.set(payment.estado);
    }

    this.observation.set(payment.observacion || '');
  }

  closeDetail(): void {
    this.selectedPayment.set(null);
    this.observation.set('');
    this.newStatus.set('VALIDADO');
  }

  validatePayment(payment: AdminPayment): void {
    this.selectedPayment.set(payment);
    this.newStatus.set('VALIDADO');
    this.observation.set('Pago confirmado correctamente.');
    this.updateStatus();
  }

  rejectPayment(payment: AdminPayment): void {
    this.selectedPayment.set(payment);
    this.newStatus.set('RECHAZADO');
    this.observation.set('Comprobante rechazado. Verificar número de operación o evidencia.');
    this.updateStatus();
  }

  updateStatus(): void {
    const payment = this.selectedPayment();

    if (!payment) {
      return;
    }

    this.isUpdating.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.paymentService
      .updateStatus(payment.id, this.newStatus(), this.observation().trim())
      .subscribe({
        next: () => {
          this.isUpdating.set(false);
          this.successMessage.set('Pago Yape actualizado correctamente.');
          this.closeDetail();
          this.loadPayments();
        },
        error: (error) => {
          this.isUpdating.set(false);
          this.errorMessage.set(
            error?.error?.message || 'No se pudo actualizar el pago.'
          );
        },
      });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value || 0);
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

  formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Sin estado';
    }

    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_REVISION: 'En revisión',
      VALIDADO: 'Validado',
      RECHAZADO: 'Rechazado',
      FALLIDO: 'Fallido',
    };

    return labels[status] || status;
  }

  statusClass(status: string | null | undefined): string {
    switch (status) {
      case 'PENDIENTE':
        return 'status-warning';
      case 'EN_REVISION':
        return 'status-review';
      case 'VALIDADO':
        return 'status-success';
      case 'RECHAZADO':
      case 'FALLIDO':
        return 'status-danger';
      default:
        return 'status-neutral';
    }
  }

  canReview(payment: AdminPayment): boolean {
    return payment.estado === 'PENDIENTE' || payment.estado === 'EN_REVISION';
  }
}