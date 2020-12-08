import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '../models/token.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  resToken = '';
  reqHeader = new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
  });

  constructor(
    public http: HttpClient,
  ) {
  }


  postToken(token: Token): Observable<Token> {
    return this.http.post<Token>(environment.serverIp + 'user/login', token);
  }

  refreshToken(token): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'token/refresh', token);
  }

  getUser(): Observable<any> {
    return this.http.get<any>(environment.serverIp + 'user/me', { headers: this.reqHeader });
  }
}

