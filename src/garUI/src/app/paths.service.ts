import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebsocketService } from './websocket-service.service';

@Injectable()
export class PathsService {

  messages: Subject<MessageEvent>;

  constructor(private wsService: WebsocketService) {}

  getPaths(
    p1: [number, number],
    p2: [number, number],
    simplificationRounds?: number,
    topK?: number,
    maxNearest?: number,
    mbrMargin?: number,
    costFunction?: string,
    skyline?: boolean,
    yenKeep?: boolean
  ) {
    this.messages = this.wsService.connect();
    this.messages.next({
      'coordinates': [
        p1,
        p2
      ],
      simplificationRounds,
      topK,
      maxNearest,
      mbrMargin,
      costFunction,
      skyline,
      yenKeep
    } as any);
    return this.messages;
  }
}
