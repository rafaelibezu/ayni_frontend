import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserService } from '../../core/services/user.service';
import { Favorites } from './favorites';

describe('Favorites', () => {
  let component: Favorites;
  let fixture: ComponentFixture<Favorites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favorites],
      providers: [
        provideRouter([]),
        { provide: FavoriteService, useValue: { findAll: () => of([]) } },
        { provide: CartService, useValue: { addItem: () => of({}) } },
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

    fixture = TestBed.createComponent(Favorites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
