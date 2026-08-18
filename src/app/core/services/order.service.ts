import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CheckoutRequest } from '../models/checkout.model';
import { Order } from '../models/order.model';
import { YapePaymentRequest } from '../models/yape-payment.model';

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

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(`${environment.apiUrl}/orders/checkout`, request)
      .pipe(map((response) => response.data));
  }

  registerYapePayment(orderId: number, request: YapePaymentRequest): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderId}/yape-payment`, request)
      .pipe(map((response) => response.data));
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderId}/cancel`, {})
      .pipe(map((response) => response.data));
  }
}
