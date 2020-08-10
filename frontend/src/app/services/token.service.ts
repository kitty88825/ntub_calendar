import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../models/token.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // serverIp = 'http://157.230.247.25/api/v1/user/';
  serverIp = 'http://140.131.114.144/api/v1/';

  constructor(
    public http: HttpClient,
  ) { }


  postToken(token: Token): Observable<Token> {
    return this.http.post<Token>(this.serverIp + 'user/login', token);
  }

  refreshToken(token): Observable<any> {
    return this.http.post<any>(this.serverIp + 'token/refresh/', token);
  }

}

