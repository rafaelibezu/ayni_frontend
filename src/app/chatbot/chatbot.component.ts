import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  isOpen = false;
  userInput = '';
  isLoading = false;

  messages: Message[] = [
    { sender: 'bot', text: 'Hola, soy tu asistente virtual en Ayni. En que te puedo ayudar hoy?' },
  ];

  private readonly http = inject(HttpClient);

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) {
      return;
    }

    const text = this.userInput;
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.isLoading = true;

    this.http.post<{ reply: string }>('http://localhost:8080/api/v1/chatbot/ask', { prompt: text })
      .subscribe({
        next: (response) => {
          this.messages.push({ sender: 'bot', text: response.reply });
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.messages.push({ sender: 'bot', text: 'Lo siento, tuve un problema de conexion con el servidor.' });
          this.isLoading = false;
        },
      });
  }
}
