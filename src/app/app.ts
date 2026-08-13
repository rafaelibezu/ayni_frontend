import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // <-- Añadimos RouterLink
import { Navbar } from './shared/components/navbar/navbar';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, ChatbotComponent], // <-- Lo agregamos aquí
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ayni-frontend');
}