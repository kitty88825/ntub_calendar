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

  deleteCalendar(id: number): Observable<Calendar> {
    return this.http.delete<Calendar>(environment.serverIp + 'calendar/calendars/' + id, {headers: this.reqHeader});
  }

  getCalendar(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(environment.serverIp + 'calendar/calendars', { headers: this.reqHeader });
  }

  fGetCalendar(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(environment.serverIp + 'calendar/calendars');
  }

  patchCalendar(id: number, formData: any): Observable<Calendar> {
    return this.http.patch<Calendar>(environment.serverIp + 'calendar/calendars/' + id, formData, { headers: this.reqHeader });
  }

}
