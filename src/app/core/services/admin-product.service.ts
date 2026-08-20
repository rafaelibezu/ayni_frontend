import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminProduct,
  AdminProductRequest,
  UpdateProductStockRequest,
} from '../models/admin-product.model';

@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AdminProduct[]> {
    return this.http
      .get<ApiResponse<AdminProduct[] | { content: AdminProduct[] }>>(
        `${environment.apiUrl}/admin/products`
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

  create(request: AdminProductRequest): Observable<AdminProduct> {
    return this.http
      .post<ApiResponse<AdminProduct>>(`${environment.apiUrl}/admin/products`, request)
      .pipe(map((response) => response.data));
  }

  update(productId: number, request: AdminProductRequest): Observable<AdminProduct> {
    return this.http
      .put<ApiResponse<AdminProduct>>(
        `${environment.apiUrl}/admin/products/${productId}`,
        request
      )
      .pipe(map((response) => response.data));
  }

  updateStock(productId: number, stock: number): Observable<AdminProduct> {
    const request: UpdateProductStockRequest = { stock };

    return this.http
      .patch<ApiResponse<AdminProduct>>(
        `${environment.apiUrl}/admin/products/${productId}/stock`,
        request
      )
      .pipe(map((response) => response.data));
  }

  toggleStatus(productId: number): Observable<AdminProduct> {
    return this.http
      .patch<ApiResponse<AdminProduct>>(
        `${environment.apiUrl}/admin/products/${productId}/toggle-status`,
        {}
      )
      .pipe(map((response) => response.data));
  }
}