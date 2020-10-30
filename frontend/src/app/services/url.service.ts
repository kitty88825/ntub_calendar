import { URL } from './../models/URL.model';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class URLService {
  resToken = '';
  reqHeader;

  constructor(
    public http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postRenewURL(url: any): Observable<URL> {
    return this.http.post<URL>(environment.serverIp + 'user/update_code', url, { headers: this.reqHeader })
  }

}
