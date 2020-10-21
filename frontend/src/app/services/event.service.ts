import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {


  resToken = '';
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postEvent(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/', formData, { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Event> {
    return this.http.delete<Event>(`${environment.serverIp}event/${id}`, { headers: this.reqHeader });
  }

  fGetEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events');
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events', { headers: this.reqHeader });
  }

  openGetEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/');
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${environment.serverIp}event/${id}`, { headers: this.reqHeader });
  }

  patchEvent(id: number, formData: any): Observable<Event> {
    return this.http.patch<Event>(`${environment.serverIp}event/${id}`, formData , { headers: this.reqHeader });
  }

}
