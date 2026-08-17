import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  findMyOrders(): Observable<Order[]> {
    return this.http
      .get<ApiResponse<Order[]>>(`${environment.apiUrl}/orders/my`)
      .pipe(map((response) => response.data));
  }

  findById(orderId: number): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderId}`)
      .pipe(map((response) => response.data));
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderId}/cancel`, {})
      .pipe(map((response) => response.data));
  }
}
