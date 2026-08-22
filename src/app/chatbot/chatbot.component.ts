import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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

  // Referencia al contenedor de mensajes para hacer scroll automático
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  messages: Message[] = [
    { sender: 'bot', text: '¡Hola! Soy tu asistente virtual en Ayni. ¿En qué te puedo ayudar hoy?' },
  ];

  private readonly http = inject(HttpClient);
  // Inyectamos esto para solucionar el bug de "Escribiendo..."
  private readonly cdr = inject(ChangeDetectorRef); 

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    if (!this.userInput.trim()) {
      return;
    }

    const text = this.userInput;
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.http.post<{ reply: string }>('http://localhost:8080/api/v1/chatbot/ask', { prompt: text })
      .subscribe({
        next: (response) => {
          this.messages.push({ sender: 'bot', text: response.reply });
          this.isLoading = false;
          this.cdr.detectChanges(); // <-- Obliga a Angular a actualizar la pantalla YA
          this.scrollToBottom();
        },
        error: (error) => {
          console.error(error);
          this.messages.push({ sender: 'bot', text: 'Lo siento, tuve un problema de conexión con el servidor.' });
          this.isLoading = false;
          this.cdr.detectChanges(); // <-- Obliga a Angular a actualizar la pantalla YA
          this.scrollToBottom();
        },
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatScrollContainer) {
          this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 50);
  }
}