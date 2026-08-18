import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-yape-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './yape-payment.html',
  styleUrl: './yape-payment.scss',
})
export class YapePayment {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly yapeNumber = '999 999 999';
  readonly yapeHolder = 'Ayni Tienda Peru';

  order = signal<Order | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  feedback = signal<string | null>(null);

  numeroOperacion = '';
  comprobanteUrl = '';

  constructor() {
    this.loadOrder();
  }

  loadOrder(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!orderId) {
      this.feedback.set('No se encontro el pedido.');
      this.isLoading.set(false);
      return;
    }

    this.orderService
      .findById(orderId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (order) => this.order.set(order),
        error: (error) => this.showError(error, 'No se pudo cargar el pedido.'),
      });
  }

  submitPayment(): void {
    const order = this.order();

    if (!order) return;
    if (!this.numeroOperacion.trim()) {
      this.feedback.set('Ingresa el numero de operacion de Yape.');
      return;
    }

    this.isSubmitting.set(true);
    this.feedback.set(null);
    this.orderService
      .registerYapePayment(order.id, {
        numeroOperacion: this.numeroOperacion.trim(),
        comprobanteUrl:
          this.comprobanteUrl.trim() || '/assets/img/payments/yape-comprobante-prueba.png',
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/user/dashboard'], { queryParams: { payment: 'sent' } }),
        error: (error) => this.showError(error, 'No se pudo registrar el comprobante.'),
      });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  }

  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set(httpError?.error?.message || fallback);
  }
}
