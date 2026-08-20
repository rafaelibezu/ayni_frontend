import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AdminDashboardService } from '../../core/services/admin-dashboard.service';
import {
  AdminDashboardSummary,
  AdminRecentOrder,
  AdminRecentPayment,
} from '../../core/models/admin-dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly dashboardService = inject(AdminDashboardService);

  summary = signal<AdminDashboardSummary | null>(null);
  recentOrders = signal<AdminRecentOrder[]>([]);
  recentPayments = signal<AdminRecentPayment[]>([]);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary(),
      orders: this.dashboardService.getRecentOrders(),
      payments: this.dashboardService.getRecentPayments(),
    }).subscribe({
      next: ({ summary, orders, payments }) => {
        this.summary.set(summary);
        this.recentOrders.set(orders);
        this.recentPayments.set(payments);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cargar el panel administrador.'
        );
      },
    });
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value || 0);
  }

  formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE').format(value || 0);
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
      PENDIENTE_PAGO: 'Pendiente',
      PAGO_EN_REVISION: 'Pago en revisión',
      PAGADO: 'Pagado',
      PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
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
      case 'PENDIENTE_PAGO':
      case 'PENDIENTE':
        return 'status-warning';

      case 'PAGO_EN_REVISION':
      case 'EN_REVISION':
        return 'status-review';

      case 'PAGADO':
      case 'VALIDADO':
      case 'PREPARANDO':
        return 'status-success';

      case 'ENVIADO':
        return 'status-info';

      case 'ENTREGADO':
        return 'status-delivered';

      case 'CANCELADO':
      case 'RECHAZADO':
      case 'FALLIDO':
        return 'status-danger';

      default:
        return 'status-neutral';
    }
  }
}