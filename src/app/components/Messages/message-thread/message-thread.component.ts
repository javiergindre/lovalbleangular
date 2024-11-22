import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Message } from 'src/app/core/models/messages/message';
import { CommentComponent } from '../comment/comment.component';
import { CommonModule } from '@angular/common';
import { MessageThreadViewModel } from 'src/app/core/models/messages/messagesViewModel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [
    CommentComponent,
    CommonModule,
    FormsModule,
    MatFormFieldModule
  ],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss'
})
export class MessageThreadComponent implements OnInit {
  @Input() messageThread : MessageThreadViewModel;
  @Output() messageReply = new EventEmitter<Message>();


  ngOnInit(): void {
  } 




  onMessage(message : Message){
    message.MessageThreadId = this.messageThread.id;
    this.messageReply.emit(message);
  }

  
}
