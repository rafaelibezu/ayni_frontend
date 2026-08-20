import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminDashboardSummary,
  AdminRecentOrder,
  AdminRecentPayment,
} from '../models/admin-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<AdminDashboardSummary> {
    return this.http
      .get<ApiResponse<AdminDashboardSummary>>(`${environment.apiUrl}/admin/dashboard/summary`)
      .pipe(map((response) => response.data));
  }

  getRecentOrders(): Observable<AdminRecentOrder[]> {
    return this.http
      .get<ApiResponse<AdminRecentOrder[]>>(`${environment.apiUrl}/admin/dashboard/recent-orders`)
      .pipe(map((response) => response.data));
  }

  getRecentPayments(): Observable<AdminRecentPayment[]> {
    return this.http
      .get<ApiResponse<AdminRecentPayment[]>>(`${environment.apiUrl}/admin/dashboard/recent-payments`)
      .pipe(map((response) => response.data));
  }
}