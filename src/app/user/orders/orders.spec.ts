import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { Orders } from './orders';

describe('Orders', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: { findMyOrders: () => of([]) } },
        {
          provide: UserService,
          useValue: {
            getMe: () =>
              of({
                id: 1,
                nombres: 'María',
                apellidos: 'González',
                email: 'maria@example.com',
                celular: null,
                documentoTipo: null,
                documentoNumero: null,
                activo: true,
                emailVerificado: true,
                roles: ['USER'],
                ultimoPedido: null,
                creadoEn: '2026-08-17T00:00:00',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
