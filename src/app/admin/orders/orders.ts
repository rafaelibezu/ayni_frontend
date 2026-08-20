import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminOrder,
  AdminOrderStatus,
} from '../../core/models/admin-order.model';
import { AdminOrderService } from '../../core/services/admin-order.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly orderService = inject(AdminOrderService);

  orders = signal<AdminOrder[]>([]);
  selectedOrder = signal<AdminOrder | null>(null);

  isLoading = signal(true);
  isDetailLoading = signal(false);
  isUpdating = signal(false);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  statusFilter = signal<'ALL' | AdminOrderStatus>('ALL');

  newStatus = signal<AdminOrderStatus>('PENDIENTE_PAGO');

  readonly statuses: AdminOrderStatus[] = [
    'PENDIENTE_PAGO',
    'PAGO_EN_REVISION',
    'PAGADO',
    'PREPARANDO',
    'ENVIADO',
    'ENTREGADO',
    'CANCELADO',
  ];

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.orderService.findAll().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.orders.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar los pedidos.'
        );
      },
    });
  }

  get filteredOrders(): AdminOrder[] {
    const search = this.searchTerm().trim().toLowerCase();

    return this.orders().filter((order) => {
      const matchesSearch =
        !search ||
        order.codigoPedido.toLowerCase().includes(search) ||
        order.clienteNombre.toLowerCase().includes(search) ||
        order.clienteEmail.toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter() === 'ALL' || order.estado === this.statusFilter();

      return matchesSearch && matchesStatus;
    });
  }

  get totalOrders(): number {
    return this.orders().length;
  }

  get pendingOrders(): number {
    return this.orders().filter(
      (order) =>
        order.estado === 'PENDIENTE_PAGO' ||
        order.estado === 'PAGO_EN_REVISION'
    ).length;
  }

  get paidOrders(): number {
    return this.orders().filter(
      (order) =>
        order.estado === 'PAGADO' ||
        order.estado === 'PREPARANDO' ||
        order.estado === 'ENVIADO'
    ).length;
  }

  get deliveredOrders(): number {
    return this.orders().filter((order) => order.estado === 'ENTREGADO').length;
  }

  openDetail(orderId: number): void {
    this.isDetailLoading.set(true);
    this.errorMessage.set(null);
    this.selectedOrder.set(null);

    this.orderService.findById(orderId).subscribe({
      next: (order) => {
        this.selectedOrder.set(order);
        this.newStatus.set(order.estado);
        this.isDetailLoading.set(false);
      },
      error: (error) => {
        this.isDetailLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cargar el detalle del pedido.'
        );
      },
    });
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  updateStatus(): void {
    const order = this.selectedOrder();

    if (!order) {
      return;
    }

    if (order.estado === this.newStatus()) {
      this.errorMessage.set('Selecciona un estado diferente para actualizar.');
      return;
    }

    this.isUpdating.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.orderService.updateStatus(order.id, this.newStatus()).subscribe({
      next: (updatedOrder) => {
        this.isUpdating.set(false);
        this.selectedOrder.set(updatedOrder);
        this.successMessage.set('Estado del pedido actualizado correctamente.');
        this.loadOrders();
      },
      error: (error) => {
        this.isUpdating.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo actualizar el estado del pedido.'
        );
      },
    });
  }

  cancelOrder(order: AdminOrder): void {
    if (order.estado === 'CANCELADO' || order.estado === 'ENTREGADO') {
      this.errorMessage.set('Este pedido ya no se puede cancelar.');
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas cancelar el pedido ${order.codigoPedido}?`
    );

    if (!confirmed) {
      return;
    }

    this.isUpdating.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.orderService.cancel(order.id).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.successMessage.set('Pedido cancelado correctamente.');
        this.closeDetail();
        this.loadOrders();
      },
      error: (error) => {
        this.isUpdating.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudo cancelar el pedido.'
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
      PENDIENTE_PAGO: 'Pendiente de pago',
      PAGO_EN_REVISION: 'Pago en revisión',
      PAGADO: 'Pagado',
      PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };

    return labels[status] || status;
  }

  formatPaymentStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Sin pago';
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
      case 'PENDIENTE_PAGO':
        return 'status-warning';
      case 'PAGO_EN_REVISION':
        return 'status-review';
      case 'PAGADO':
      case 'PREPARANDO':
        return 'status-success';
      case 'ENVIADO':
        return 'status-info';
      case 'ENTREGADO':
        return 'status-delivered';
      case 'CANCELADO':
        return 'status-danger';
      default:
        return 'status-neutral';
    }
  }

  paymentStatusClass(status: string | null | undefined): string {
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

  canCancel(order: AdminOrder): boolean {
    return order.estado !== 'CANCELADO' && order.estado !== 'ENTREGADO';
  }
}