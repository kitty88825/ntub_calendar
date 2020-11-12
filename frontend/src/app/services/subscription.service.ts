import { Event } from './../models/event.model';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  resToken = '';
  reqHeader;

  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postSubscription(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'calendar/subscription', formData, { headers: this.reqHeader });
  }

  getEventSubscription(): Observable<Event[]> {
    return this.http.get<Event[]>(environment.serverIp + 'event/events?subscribed=true', { headers: this.reqHeader });
  }

  getCalendarSubscription(): Observable<any> {
    return this.http.get<any>(environment.serverIp + 'calendar/calendars?subscribed=true', { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Subscription> {
    return this.http.delete<Subscription>(`${environment.serverIp}calendar/subscription/${id}`, { headers: this.reqHeader });
  }

  getURL(): Observable<any> {
    return this.http.get<any>(environment.serverIp + 'user/me', { headers: this.reqHeader });
  }

  postCalendarSubscribe(formDate): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'calendar/calendars/subscribe', formDate, { headers: this.reqHeader });
  }

  postEventSubscribe(formDate): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/subscribe', formDate, { headers: this.reqHeader });
  }

  postEventUnSub(formDate): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'event/events/unsubscribe', formDate, { headers: this.reqHeader });
  }

  postCalendarUnSub(formDate): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'calendar/calendars/unsubscribe', formDate, { headers: this.reqHeader });
  }
}
