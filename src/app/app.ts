import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from './shared/components/navbar/navbar';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ayni-frontend');
  protected readonly isAdminRoute = signal(false);

  constructor(private readonly router: Router) {
    this.setAdminRouteState(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.setAdminRouteState(event.urlAfterRedirects);
      });
  }

  private setAdminRouteState(url: string): void {
    this.isAdminRoute.set(url === '/admin' || url.startsWith('/admin/'));
  }
}
