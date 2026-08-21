import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminPayment,
  AdminPaymentStatus,
  UpdateAdminPaymentStatusRequest,
} from '../models/admin-payment.model';

@Injectable({
  providedIn: 'root',
})
export class AdminPaymentService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AdminPayment[]> {
    return this.http
      .get<ApiResponse<AdminPayment[] | { content: AdminPayment[] }>>(
        `${environment.apiUrl}/admin/payments`
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

  updateStatus(
    paymentId: number,
    estado: AdminPaymentStatus,
    observacion: string
  ): Observable<AdminPayment> {
    const request: UpdateAdminPaymentStatusRequest = {
      estado,
      observacion,
    };

    return this.http
      .put<ApiResponse<AdminPayment>>(
        `${environment.apiUrl}/admin/payments/${paymentId}/status`,
        request
      )
      .pipe(map((response) => response.data));
  }
}