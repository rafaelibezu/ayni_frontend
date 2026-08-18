import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Address, CreateAddressRequest } from '../models/address.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Address[]> {
    return this.http
      .get<ApiResponse<Address[]>>(`${environment.apiUrl}/users/me/addresses`)
      .pipe(map((response) => response.data));
  }

  create(request: CreateAddressRequest): Observable<Address> {
    return this.http
      .post<ApiResponse<Address>>(`${environment.apiUrl}/users/me/addresses`, request)
      .pipe(map((response) => response.data));
  }
}
