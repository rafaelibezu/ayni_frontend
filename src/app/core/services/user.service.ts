import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AddressRequest,
  UpdateUserProfileRequest,
  UpdatePasswordRequest,
  UserAddress,
  UserProfile,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${environment.apiUrl}/users/me`)
      .pipe(map((response) => response.data));
  }

  updateMe(request: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http
      .put<ApiResponse<UserProfile>>(`${environment.apiUrl}/users/me`, request)
      .pipe(map((response) => response.data));
  }

  changePassword(request: UpdatePasswordRequest): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(`${environment.apiUrl}/users/me/password`, request)
      .pipe(map(() => undefined));
  }

  getAddresses(): Observable<UserAddress[]> {
    return this.http
      .get<ApiResponse<UserAddress[]>>(`${environment.apiUrl}/users/me/addresses`)
      .pipe(map((response) => response.data));
  }

  createAddress(request: AddressRequest): Observable<UserAddress> {
    return this.http
      .post<ApiResponse<UserAddress>>(`${environment.apiUrl}/users/me/addresses`, request)
      .pipe(map((response) => response.data));
  }

  updateAddress(addressId: number, request: AddressRequest): Observable<UserAddress> {
    return this.http
      .put<ApiResponse<UserAddress>>(
        `${environment.apiUrl}/users/me/addresses/${addressId}`,
        request,
      )
      .pipe(map((response) => response.data));
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${environment.apiUrl}/users/me/addresses/${addressId}`)
      .pipe(map(() => undefined));
  }

  setMainAddress(addressId: number): Observable<UserAddress> {
    return this.http
      .patch<ApiResponse<UserAddress>>(
        `${environment.apiUrl}/users/me/addresses/${addressId}/main`,
        {},
      )
      .pipe(map((response) => response.data));
  }
}
