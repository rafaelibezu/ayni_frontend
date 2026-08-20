import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminOrder,
  AdminOrderStatus,
  UpdateAdminOrderStatusRequest,
} from '../models/admin-order.model';

@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AdminOrder[]> {
    return this.http
      .get<ApiResponse<AdminOrder[] | { content: AdminOrder[] }>>(
        `${environment.apiUrl}/admin/orders`
      )
      .pipe(
        map((response) => {
          const data = response.data;

          if (Array.isArray(data)) {
            return data;
          }

          return data.content;
        })
      );
  }

  findById(orderId: number): Observable<AdminOrder> {
    return this.http
      .get<ApiResponse<AdminOrder>>(`${environment.apiUrl}/admin/orders/${orderId}`)
      .pipe(map((response) => response.data));
  }

  updateStatus(orderId: number, estado: AdminOrderStatus): Observable<AdminOrder> {
    const request: UpdateAdminOrderStatusRequest = { estado };

    return this.http
      .put<ApiResponse<AdminOrder>>(
        `${environment.apiUrl}/admin/orders/${orderId}/status`,
        request
      )
      .pipe(map((response) => response.data));
  }

  cancel(orderId: number): Observable<AdminOrder> {
    return this.http
      .patch<ApiResponse<AdminOrder>>(
        `${environment.apiUrl}/admin/orders/${orderId}/cancel`,
        {}
      )
      .pipe(map((response) => response.data));
  }
}