import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './chatbot/chatbot.component'; // 👇 1. Importamos el componente

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotComponent], // 👇 2. Lo declaramos aquí
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ayni-frontend');
}