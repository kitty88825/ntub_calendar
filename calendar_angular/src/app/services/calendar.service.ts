import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Observable } from 'rxjs';
import { ShareDataService } from '../services/share-data.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  resToken = '';
  serverIp = 'http://127.0.0.1:8000/api/v1/';


  constructor(
    private http: HttpClient,
    private shareDataService: ShareDataService,
  ) {
    this.resToken = this.shareDataService.getToken();
  }

  postEvent(formData: any): Observable<any> {
    const reqHeader = new HttpHeaders({
      Authorization: 'token ' + this.resToken
    });
    return this.http.post<any>(this.serverIp + 'event/', formData, { headers: reqHeader });
  }

  deleteEvent(id: number): Observable<Event> {
    const reqHeader = new HttpHeaders({
      Authorization: 'token ' + this.resToken
    });
    return this.http.delete<Event>(`${this.serverIp}event/${id}`, {headers: reqHeader});
  }

  getEvents(): Observable<Event[]> {
    const reqHeader = new HttpHeaders({
      Authorization: 'token ' + this.resToken
    });
    return this.http.get<Event[]>(this.serverIp + 'event/', { headers: reqHeader });
  }

  getEvent(id: number): Observable<Event> {
    const reqHeader = new HttpHeaders({
      Authorization: 'token ' + this.resToken
    });
    return this.http.get<Event>(`${this.serverIp}event/${id}`, { headers: reqHeader });
  }

  patchEvent(id: number, formData: any): Observable<Event> {
    const reqHeader = new HttpHeaders({
      Authorization: 'token ' + this.resToken
    });
    return this.http.patch<Event>(`${this.serverIp}event/${id}`, formData, { headers: reqHeader });
  }

}
