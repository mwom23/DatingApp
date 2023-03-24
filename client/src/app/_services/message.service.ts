import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/enviroment';
import { Message } from '../_models/message';
import { getPaginatedResult, getPaginationHeaders } from './paginationsHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = enviroment.apiUrl;

  constructor(private http: HttpClient) { }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(username: String) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  sendMessages(username: string, content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages', 
    {recipientUsername: username, content});
  }

  deleteMessage(id:number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
