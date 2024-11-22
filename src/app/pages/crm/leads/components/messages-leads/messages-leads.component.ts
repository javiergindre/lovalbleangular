import { ChangeDetectorRef, Component, inject, Inject, Input, OnInit } from '@angular/core';
import { Message } from 'src/app/core/models/messages/message';
import { MessageThreadComponent } from "../../../../../components/Messages/message-thread/message-thread.component";
import { MessageThread } from 'src/app/core/models/messages/messageThread';
import { MessagesService } from 'src/app/core/services/messages.service';
import { MessageThreadViewModel } from 'src/app/core/models/messages/messagesViewModel';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MessageCategory } from 'src/app/core/models/invoices/MessageCategory';

@Component({
  selector: 'app-messages-leads',
  standalone: true,
  imports: [MessageThreadComponent,
    MatCardModule,
    MatChipsModule,
    TablerIconsModule,
    MatDividerModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    FormsModule,],
  templateUrl: './messages-leads.component.html',
  styleUrl: './messages-leads.component.scss'
})

export class MessagesLeadsComponent implements OnInit {
  messageThreads: MessageThreadViewModel[] = [];
  messagesService: MessagesService = inject(MessagesService)
  private cdr = inject(ChangeDetectorRef)

  @Input() id: number;
  @Input() entityType: number;


  messageText = ''

  ngOnInit(): void {
    this.loadComments();
  }
  loadComments(): void {
    this.messagesService.getMessages(this.id,this.entityType).subscribe((data: MessageThreadViewModel[]) => {
      this.messageThreads = data;
      console.log(this.messageThreads);
      const sortedThreads = data.sort((a, b) => {
        return this.getLatestDateOfMessage(b.mainMessage).getTime() - this.getLatestDateOfMessage(a.mainMessage).getTime();
      });

      this.cdr.detectChanges();
    });
  }


  onMessage(message: Message) {
    this.messagesService.addMessageReply(message).subscribe(() => {
      this.loadComments();
    });
  }

  newThread() {
    if (this.messageText != '') {
      const newMessageThread: Message = {
        Body: this.messageText,
        CreateDate: new Date(),
      }

      this.messagesService.addMessageThread(newMessageThread, this.entityType, this.id).subscribe(() => {
        this.loadComments();
        this.messageText = '';
      });
    }
  }


  getLatestDateOfMessage(message: any): Date {
    let latestDate = new Date(message.createDate);
    const stack = [...message.replies];

    while (stack.length > 0) {
      const current = stack.pop(); // saco y tomo el ultimo elemento
      const currentDate = new Date(current.createDate);

      if (currentDate > latestDate) {
        latestDate = currentDate;
      }

      // aca agrego a nuestro array de comentarios a revisar las respuestas de las respuestas ( si es que existen)
      if (current.replies && current.replies.length > 0) {
        stack.push(...current.replies);
      }
    }

    return latestDate;
  };


}
