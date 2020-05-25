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

  postEvent(formData: any): Observable<any> {
    return this.http.post<any>(this.serverIp + 'event/', formData);
  }

  deleteEvent(id: number): Observable<Event> {
    return this.http.delete<Event>(`${this.serverIp}event/${id}`);
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.serverIp + 'event/');
  }


}
