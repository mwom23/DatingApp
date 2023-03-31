import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection } from '@microsoft/signalr/dist/esm/HubConnection';
import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder';
import { BehaviorSubject, take } from 'rxjs';
import { enviroment } from 'src/environments/enviroment';
import { Group } from '../_models/group';
import { Message } from '../_models/message';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationsHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = enviroment.apiUrl;
  hubUrl = enviroment.hubUrl;
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient) { }

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
          accessTokenFactory: () => user.token
        })
        .withAutomaticReconnect()
        .build();


      this.hubConnection.start().catch(error => console.log(error));

      this.hubConnection.on('ReceiveMessageThread', messages => {
        this.messageThreadSource.next(messages);
      })

      this.hubConnection.on('UpdatedGroup', (group:Group) => {
        if (group.connections.some(x => x.username === otherUsername)) {
          this.messageThread$.pipe(take(1)).subscribe({
            next: messages => {
              messages.forEach(message => {
                if (!message.dareRead) {
                  message.dareRead = new Date(Date.now())
                }
              })
              this.messageThreadSource.next([...messages]);
            }
          })
        }
      })

      this.hubConnection.on('NewMessage', message => {
        this.messageThread$.pipe(take(1)).subscribe({
          next: messages => {
            this.messageThreadSource.next([...messages, message])
          }
        })
      })
  }

  stopHubConnection() {
    if (this.hubConnection) {
    this.hubConnection.stop();
    }

  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(username: String) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessages(username: string, content: string) {
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content})
      .catch(error => console.log(error));
  }

  deleteMessage(id:number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
