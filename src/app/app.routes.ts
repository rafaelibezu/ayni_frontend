import { Routes } from '@angular/router';

import { Auth } from './public/auth/auth';
import { Home } from './public/home/home';
import { Dashboard } from './admin/dashboard/dashboard';
import { UserDashboard } from './user/dashboard/dashboard';
import { Cart } from './user/cart/cart';
import { Profile } from './user/profile/profile';
import { Orders as UserOrders } from './user/orders/orders';
import { Favorites } from './user/favorites/favorites';

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
  {
    path: 'user/dashboard',
    component: UserDashboard,
    canActivate: [authGuard],
  },
  {
    path: 'user/cart',
    component: Cart,
    canActivate: [authGuard],
  },
  {
    path: 'user/profile',
    component: Profile,
    canActivate: [authGuard],
  },
  {
    path: 'user/orders',
    component: UserOrders,
    canActivate: [authGuard],
  },
  {
    path: 'user/favorites',
    component: Favorites,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
