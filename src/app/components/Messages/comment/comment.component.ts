import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Message } from 'src/app/core/models/messages/message';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MessageViewModel } from 'src/app/core/models/messages/messagesViewModel';
@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    TablerIconsModule,
    MatDividerModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    FormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input() message: MessageViewModel;
  @Input() isAnswer: boolean = true;
  @Input() isFirst: boolean;
  @Output() messageReply = new EventEmitter<Message>();
  replyText = ''


  constructor() {
    // para que el pipe este en español
    registerLocaleData(localeEs);
  }

  istoggleReply = true;

  toggleReply() {
    this.istoggleReply = !this.istoggleReply;
  }

  calculateTimeAgo(date: Date): string {
    const utcDateString = date + "Z";
    const utcDate = new Date(utcDateString);
    const messageDate = new Date(utcDate);
    const now = new Date();

    const seconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    // divido en segundos para saber si estamos en años, meses etc
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      return `hace ${interval} año${interval === 1 ? '' : 's'}`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `hace ${interval} mes${interval === 1 ? '' : 'es'}`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `hace ${interval} día${interval === 1 ? '' : 's'}`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `hace ${interval} hora${interval === 1 ? '' : 's'}`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `hace ${interval} minuto${interval === 1 ? '' : 's'}`;
    }
    return 'hace unos segundos';
  }

  reply() {
    if (this.replyText && this.replyText != '') {

      const replyMessage: Message = {
        CreateDate: new Date(),
        Body: this.replyText,
        ReplyToMessageId: this.message.id,
      }
      this.messageReply.emit(replyMessage);
    }
  }

  onMessage(message: Message) {
    this.messageReply.emit(message);
  }

  getInitials(personName: string | null): string {
    if (!personName) {
      return '';
    }

    const parts = personName.split(/[\s,]+/).filter((part) => part.length > 0);
    let initials = '';

    for (let i = 0; i < parts.length; i++) {
      if (initials.length < 2) {
        initials += parts[i].charAt(0).toUpperCase();
      }
    }

    if (initials.length < 2) {
      initials = personName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 2)
        .toUpperCase();
    }

    return initials;
  }


  getInitialsCurrentUser(): string {
    return this.getInitials(localStorage.getItem('personName'));
  }


}
