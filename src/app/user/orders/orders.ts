import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Order } from '../../core/models/order.model';
import { UserProfile } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);

  user = signal<UserProfile | null>(this.authService.currentUser() as UserProfile | null);
  orders = signal<Order[]>([]);
  expandedOrderId = signal<number | null>(null);
  orderDetail = signal<Order | null>(null);
  isLoading = signal(true);
  loadingDetailId = signal<number | null>(null);
  cancellingOrderId = signal<number | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor() {
    this.loadUser();
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService
      .findMyOrders()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: (error) => this.showError(error, 'No se pudieron cargar tus pedidos.'),
      });
  }

  toggleDetails(order: Order): void {
    if (this.expandedOrderId() === order.id) {
      this.expandedOrderId.set(null);
      this.orderDetail.set(null);
      return;
    }
    this.loadingDetailId.set(order.id);
    this.feedback.set(null);
    this.orderService
      .findById(order.id)
      .pipe(finalize(() => this.loadingDetailId.set(null)))
      .subscribe({
        next: (detail) => {
          this.orderDetail.set(detail);
          this.expandedOrderId.set(order.id);
        },
        error: (error) => this.showError(error, 'No se pudo cargar el detalle del pedido.'),
      });
  }

  cancelOrder(order: Order): void {
    if (!window.confirm(`¿Deseas cancelar el pedido ${order.codigoPedido}?`)) return;
    this.cancellingOrderId.set(order.id);
    this.feedback.set(null);
    this.orderService
      .cancelOrder(order.id)
      .pipe(finalize(() => this.cancellingOrderId.set(null)))
      .subscribe({
        next: (updated) => {
          this.orders.update((orders) =>
            orders.map((item) => (item.id === updated.id ? updated : item)),
          );
          if (this.orderDetail()?.id === updated.id) this.orderDetail.set(updated);
          this.feedback.set({ type: 'success', text: 'Tu pedido fue cancelado correctamente.' });
        },
        error: (error) => this.showError(error, 'No se pudo cancelar el pedido.'),
      });
  }

  canCancel(status: string): boolean {
    return ['PENDIENTE_PAGO', 'PAGO_EN_REVISION', 'PAGADO', 'PREPARANDO'].includes(status);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDIENTE_PAGO: 'Pendiente de pago',
      PAGO_EN_REVISION: 'Pago en revisión',
      PAGADO: 'Pagado',
      PREPARANDO: 'Procesando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status.replaceAll('_', ' ');
  }

  statusClass(status: string): string {
    if (status === 'ENTREGADO') return 'delivered';
    if (status === 'CANCELADO') return 'cancelled';
    if (status === 'ENVIADO') return 'shipped';
    return 'processing';
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  private loadUser(): void {
    this.userService
      .getMe()
      .subscribe({ next: (user) => this.user.set(user), error: () => undefined });
  }
  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
