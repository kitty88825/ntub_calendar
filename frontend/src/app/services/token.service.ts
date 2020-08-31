import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../models/token.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(
    public http: HttpClient,
  ) { }


  postToken(token: Token): Observable<Token> {
    return this.http.post<Token>(environment.serverIp + 'user/login', token);
  }

  refreshToken(token): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'token/refresh/', token);
  }

}

