import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';
import { AdminTopbar } from '../../components/admin-topbar/admin-topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, AdminTopbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}