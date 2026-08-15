import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Favorite } from '../../core/models/favorite.model';
import { Order } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { UserProfile } from '../../core/models/user.model';

import { FavoriteService } from '../../core/services/favorite.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class UserDashboard {
  private readonly userService = inject(UserService);
  private readonly orderService = inject(OrderService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly productService = inject(ProductService);

  user = signal<UserProfile | null>(null);
  recentOrders = signal<Order[]>([]);
  favorites = signal<Favorite[]>([]);
  recommendedProducts = signal<Product[]>([]);
  isLoading = signal(true);

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);

    this.userService.getMe().subscribe({
      next: (user) => this.user.set(user),
      error: () => this.user.set(null),
    });

    this.orderService.findMyOrders().subscribe({
      next: (orders) => this.recentOrders.set(orders.slice(0, 3)),
      error: () => this.recentOrders.set([]),
    });

    this.favoriteService.findAll().subscribe({
      next: (favorites) => this.favorites.set(favorites.slice(0, 3)),
      error: () => this.favorites.set([]),
    });

    this.productService.findFeatured().subscribe({
      next: (products) => {
        this.recommendedProducts.set(products.slice(0, 3));
        this.isLoading.set(false);
      },
      error: () => {
        this.recommendedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  get profilePercent(): number {
    const user = this.user();

    if (!user) {
      return 0;
    }

    const fields = [
      user.nombres,
      user.apellidos,
      user.email,
      user.celular,
      user.documentoTipo,
      user.documentoNumero,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }

  get lastOrder(): Order | null {
    return this.recentOrders()[0] || null;
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Sin estado';
    }

    const labels: Record<string, string> = {
      PENDIENTE_PAGO: 'Pendiente de pago',
      PAGO_EN_REVISION: 'Pago en revision',
      PAGADO: 'Pagado',
      PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };

    return labels[status] || status;
  }

  statusProgress(status: string | null | undefined): number {
    switch (status) {
      case 'PENDIENTE_PAGO':
        return 15;
      case 'PAGO_EN_REVISION':
        return 30;
      case 'PAGADO':
        return 45;
      case 'PREPARANDO':
        return 60;
      case 'ENVIADO':
        return 80;
      case 'ENTREGADO':
      case 'CANCELADO':
        return 100;
      default:
        return 10;
    }
  }
}
