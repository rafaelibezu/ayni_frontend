import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminCategory,
  AdminCategoryRequest,
} from '../models/admin-category.model';

@Injectable({
  providedIn: 'root',
})
export class AdminCategoryService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AdminCategory[]> {
    return this.http
      .get<ApiResponse<AdminCategory[]>>(`${environment.apiUrl}/admin/categories`)
      .pipe(map((response) => response.data));
  }

  create(request: AdminCategoryRequest): Observable<AdminCategory> {
    return this.http
      .post<ApiResponse<AdminCategory>>(`${environment.apiUrl}/admin/categories`, request)
      .pipe(map((response) => response.data));
  }

  update(categoryId: number, request: AdminCategoryRequest): Observable<AdminCategory> {
    return this.http
      .put<ApiResponse<AdminCategory>>(
        `${environment.apiUrl}/admin/categories/${categoryId}`,
        request
      )
      .pipe(map((response) => response.data));
  }

  toggleStatus(categoryId: number): Observable<AdminCategory> {
    return this.http
      .patch<ApiResponse<AdminCategory>>(
        `${environment.apiUrl}/admin/categories/${categoryId}/toggle-status`,
        {}
      )
      .pipe(map((response) => response.data));
  }
}