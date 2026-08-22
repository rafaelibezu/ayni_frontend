import { Routes } from '@angular/router';

import { Auth } from './public/auth/auth';
import { Home } from './public/home/home';
import { Catalog } from './public/catalog/catalog';
import { ProductDetail } from './public/product-detail/product-detail';
import { Dashboard } from './admin/dashboard/dashboard';
import { UserDashboard } from './user/dashboard/dashboard';
import { Cart } from './user/cart/cart';
import { Checkout } from './user/checkout/checkout';
import { Profile } from './user/profile/profile';
import { Orders as UserOrders } from './user/orders/orders';
import { Favorites } from './user/favorites/favorites';
import { YapePayment } from './user/yape-payment/yape-payment';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayout } from './admin/layout/admin-layout/admin-layout';
import { Products } from './admin/products/products';
import { Categories } from './admin/categories/categories';
import { Orders as AdminOrders } from './admin/orders/orders';
import { Payments } from './admin/payments/payments';
import { Users } from './admin/users/users';

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
    path: 'catalog',
    component: Catalog,
  },
  {
    path: 'products/:slug',
    component: ProductDetail,
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
    path: 'user/checkout',
    component: Checkout,
    canActivate: [authGuard],
  },
  {
    path: 'user/checkout/yape/:orderId',
    component: YapePayment,
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
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'products',
        component: Products,
      },
      {
        path: 'categories',
        component: Categories,
      },
      {
        path: 'orders',
        component: AdminOrders,
      },
      {
        path: 'payments',
        component: Payments,
      },
      {
        path: 'users',
        component: Users,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];