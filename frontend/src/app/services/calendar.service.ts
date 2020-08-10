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
  // serverIp = 'http://157.230.247.25/api/v1/calendar/';
  serverIp = 'http://140.131.114.144/api/v1/calendar/';
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'token ' + localStorage.getItem('refresh_token')
    });
  }

  // postCalendar(formData: any): Observable<any> {
  //   return this.http.post<any>(this.serverIp + 'calendars', formData, { headers: this.reqHeader });
  // }

  // deleteEvent(id: number): Observable<Event> {
  //   return this.http.delete<Event>(`${this.serverIp}event/${id}`, {headers: this.reqHeader});
  // }

  getCalendar(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(this.serverIp + 'calendars');
  }

  // getEvent(id: number): Observable<Event> {
  //   return this.http.get<Event>(`${this.serverIp}event/${id}`, { headers: this.reqHeader });
  // }

  // patchEvent(id: number, formData: any): Observable<Event> {
  //   return this.http.patch<Event>(`${this.serverIp}event/${id}`, formData, { headers: this.reqHeader });
  // }

}
