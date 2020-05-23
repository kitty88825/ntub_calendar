import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  serverIp = 'http://127.0.0.1:8000/api/v1/';

  constructor(
    private http: HttpClient
  ) { }

  postEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.serverIp + 'event/', event);
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.serverIp + 'event/');
  }


}
