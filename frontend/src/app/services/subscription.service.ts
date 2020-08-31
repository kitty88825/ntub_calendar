import { environment } from './../../environments/environment';
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

  getSubscription(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(environment.serverIp + 'calendar/subscription', { headers: this.reqHeader });
  }

  deleteEvent(id: number): Observable<Subscription> {
    return this.http.delete<Subscription>(`${environment.serverIp}calendar/subscription/${id}`, { headers: this.reqHeader });
  }

  getURL(): Observable<any> {
    return this.http.get<any>(environment.serverIp + 'user/me', { headers: this.reqHeader });
  }
}
