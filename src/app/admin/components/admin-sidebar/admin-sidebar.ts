import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminMenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebar {
  menuItems: AdminMenuItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'grid',
    },
    {
      label: 'Productos',
      route: '/admin/products',
      icon: 'tag',
    },
    {
      label: 'Categorías',
      route: '/admin/categories',
      icon: 'folder',
    },
    {
      label: 'Órdenes',
      route: '/admin/orders',
      icon: 'bag',
    },
    {
      label: 'Pagos Yape',
      route: '/admin/payments',
      icon: 'wallet',
    },
    {
      label: 'Usuarios',
      route: '/admin/users',
      icon: 'users',
    },
  ];
}
