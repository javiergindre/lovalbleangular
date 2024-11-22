import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { MessageThread } from '../models/messages/messageThread';
import { Observable, of, tap } from 'rxjs';
import { Message } from '../models/messages/message';
import { MessageThreadViewModel } from '../models/messages/messagesViewModel';
import { MessageCategory } from '../models/invoices/MessageCategory';
import { MessageRequest } from '../models/messages/MessageRequest';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  constructor() {}

  getMessagesLead(idLead: number): Observable<MessageThreadViewModel[]> {
    return this.http.get<MessageThreadViewModel[]>(
      this.baseUrl + endpoints.MESSAGE_LEADS + '/' + idLead
    );
  }

  getMessages(
    id: number,
    idType: number
  ): Observable<MessageThreadViewModel[]> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('idType', idType.toString());

    return this.http.get<MessageThreadViewModel[]>(
      this.baseUrl + endpoints.MESSAGE_GET,
      { params }
    );
  }

  addMessageReply(message: Message) {
    let userName = localStorage.getItem('userName');
    const endpoint = this.baseUrl + endpoints.MESSAGE_NEW_REPLY;

    if (userName) {
      const messageRequest: MessageRequest = {
        Message: message,
        UserName: userName,
      };

      return this.http
        .post(endpoint, messageRequest)
        .pipe(tap((result) => console.log(result)));
    }
    return of([]);
  }

  addMessageThread(
    message: Message,
    idCategory: MessageCategory,
    idEntity: number
  ) {
    let userName = localStorage.getItem('userName');
    const endpoint = this.baseUrl + endpoints.MESSAGE_NEW_THREAD;

    if (userName) {
      const messageRequest: MessageRequest = {
        Message: message,
        IdCategory: idCategory,
        IdCategoryEntity: idEntity,
        UserName: userName,
      };

      return this.http
        .post(endpoint, messageRequest)
        .pipe(tap((result) => console.log(result)));
    }
    return of([]);
  }
}
