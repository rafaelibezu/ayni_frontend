import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Interfaz para estructurar los mensajes
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  isOpen = false;
  userInput = '';
  isLoading = false;
  
  // Historial de mensajes, con el saludo inicial
  messages: Message[] = [
    { sender: 'bot', text: '¡Hola! Soy tu asistente virtual en Ayni. ¿En qué te puedo ayudar hoy?' }
  ];

  private http = inject(HttpClient);

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // 1. Guardar mensaje del usuario y limpiar input
    const text = this.userInput;
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.isLoading = true;

    // 2. Hacer la petición a Spring Boot
    this.http.post<{reply: string}>('http://localhost:8080/api/v1/chatbot/ask', { prompt: text })
      .subscribe({
        next: (response) => {
          this.messages.push({ sender: 'bot', text: response.reply });
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.messages.push({ sender: 'bot', text: 'Lo siento, tuve un problema de conexión con el servidor.' });
          this.isLoading = false;
        }
      });
  }
}