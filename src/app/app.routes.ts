import { Routes } from '@angular/router';

import { Auth } from './public/auth/auth';
import { Home } from './public/home/home';
import { Dashboard } from './admin/dashboard/dashboard';
import { Cart } from './user/cart/cart'; // 👇 1. Importamos el carrito

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Auth,
    canActivate: [guestGuard],
    data: {
      mode: 'login',
    },
  },
  {
    path: 'register',
    component: Auth,
    canActivate: [guestGuard],
    data: {
      mode: 'register',
    },
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [authGuard, adminGuard],
  },
  // 👇 2. Agregamos la ruta del carrito (antes del comodín **)
  {
    path: 'cart',
    component: Cart,
    // canActivate: [authGuard], // Descomenta esto si quieres que solo usuarios logueados entren
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];