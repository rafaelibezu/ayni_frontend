import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
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

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
