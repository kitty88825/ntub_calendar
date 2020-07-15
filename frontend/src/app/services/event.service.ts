import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {


  resToken = '';
  serverIp = 'http://157.230.247.25/api/v1/';
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'token ' + localStorage.getItem('refresh_token')
    });
  }

  postEvent(formData: any): Observable<any> {
    return this.http.post<any>(this.serverIp + 'event/', formData, { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Event> {
    return this.http.delete<Event>(`${this.serverIp}event/${id}`, {headers: this.reqHeader});
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.serverIp + 'event/', { headers: this.reqHeader });
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.serverIp}event/${id}`, { headers: this.reqHeader });
  }

  patchEvent(id: number, formData: any): Observable<Event> {
    return this.http.patch<Event>(`${this.serverIp}event/${id}`, formData, { headers: this.reqHeader });
  }

}
