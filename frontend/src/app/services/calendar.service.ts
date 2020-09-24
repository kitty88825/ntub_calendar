import { environment } from './../../environments/environment';
import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Observable } from 'rxjs';
import { Calendar } from '../models/calendar.models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  resToken = '';
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postCalendar(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'calendar/calendars', formData, { headers: this.reqHeader });
  }

  // deleteEvent(id: number): Observable<Event> {
  //   return this.http.delete<Event>(`${this.serverIp}event/${id}`, {headers: this.reqHeader});
  // }

  getCalendar(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(environment.serverIp + 'calendar/calendars', { headers: this.reqHeader });
  }

  fGetCalendar(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(environment.serverIp + 'calendar/calendars');
  }

  // getEvent(id: number): Observable<Event> {
  //   return this.http.get<Event>(`${this.serverIp}event/${id}`, { headers: this.reqHeader });
  // }

  // patchEvent(id: number, formData: any): Observable<Event> {
  //   return this.http.patch<Event>(`${this.serverIp}event/${id}`, formData, { headers: this.reqHeader });
  // }

}
