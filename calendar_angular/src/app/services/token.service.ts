import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../models/token.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  serverIp = 'http://127.0.0.1:8000/api/v1/user/';

  constructor(
    public http: HttpClient,
  ) { }


  postToken(token: Token): Observable<Token> {
    return this.http.post<Token>(this.serverIp + 'login', token);
  }


}

