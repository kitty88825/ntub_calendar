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
  reqHeader = new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
  });


  constructor(
    private http: HttpClient,
  ) {
  }

  postEvent(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events', formData, { headers: this.reqHeader });
  }

  postEventMany(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/bulk_create', formData, { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Event> {
    return this.http.delete<Event>(`${environment.serverIp}event/events/${id}`, { headers: this.reqHeader });
  }

  fGetEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events');
  }

  fGetEventsTime(time: any): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?month=' + time + '-01T00%3A00%3A00%2B08%3A00');
  }

  getEventsTime(time: any): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?month=' + time + '-01T00%3A00%3A00%2B08%3A00'
      , { headers: this.reqHeader });
  }

  getEventsYear(sTime: any, eTime: any): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?study_years=' + sTime +
      '-01T00%3A00%3A00%2B08%3A00&semester=' + eTime + '-01T00%3A00%3A00%2B08%3A00'
      , { headers: this.reqHeader });
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events', { headers: this.reqHeader });
  }

  getEvents_event(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?nature=event', { headers: this.reqHeader });
  }

  getEvents_meet(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?nature=meeting', { headers: this.reqHeader });
  }

  openGetEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/');
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${environment.serverIp}event/events/${id}`, { headers: this.reqHeader });
  }

  patchEvent(id: number, formData: any): Observable<Event> {
    return this.http.patch<Event>(`${environment.serverIp}event/events/${id}`, formData, { headers: this.reqHeader });
  }

  postEventSubscribe(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/subscribe', formData, { headers: this.reqHeader });
  }

  postSuggestTime(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/suggested_time', formData, { headers: this.reqHeader });
  }

  postEventResponse(id: number, formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/' + id + '/response', formData, { headers: this.reqHeader });
  }

}
