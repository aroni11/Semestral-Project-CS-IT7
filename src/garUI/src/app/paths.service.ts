import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebsocketService } from './websocket-service.service';

@Injectable()
export class PathsService {

  messages: Subject<MessageEvent>;

  constructor(private wsService: WebsocketService) {}

  getPaths(p1: [number, number], p2: [number, number]) {
    this.messages = this.wsService.connect();
    this.messages.next({
      'coordinates': [
        p1,
        p2
      ]
    } as any);
    return this.messages;
  }
}
