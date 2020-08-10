import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.model';
import { URL } from '../models/URL.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  resToken = '';
  // serverIp = 'http://157.230.247.25/api/v1/';
  serverIp = 'http://140.131.114.144/api/v1/';
  reqHeader;

  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postSubscription(formData: any): Observable<any> {
    return this.http.post<any>(this.serverIp + 'calendar/subscription', formData, { headers: this.reqHeader });
  }

  getSubscription(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.serverIp + 'calendar/subscription', { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Subscription> {
    return this.http.delete<Subscription>(`${this.serverIp}calendar/subscription/${id}`, { headers: this.reqHeader });
  }

  getURL(): Observable<any> {
    return this.http.get<any>(this.serverIp + 'user/me', { headers: this.reqHeader });
  }
}
