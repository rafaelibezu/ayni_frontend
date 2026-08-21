import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminUser,
  CreateAdminUserRequest,
} from '../models/admin-user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[] | { content: AdminUser[] }>>(
        `${environment.apiUrl}/admin/users`
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

  findById(userId: number): Observable<AdminUser> {
    return this.http
      .get<ApiResponse<AdminUser>>(`${environment.apiUrl}/admin/users/${userId}`)
      .pipe(map((response) => response.data));
  }

  createAdmin(request: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http
      .post<ApiResponse<AdminUser>>(`${environment.apiUrl}/admin/users/admin`, request)
      .pipe(map((response) => response.data));
  }

  toggleStatus(userId: number): Observable<AdminUser> {
    return this.http
      .patch<ApiResponse<AdminUser>>(
        `${environment.apiUrl}/admin/users/${userId}/toggle-status`,
        {}
      )
      .pipe(map((response) => response.data));
  }
}