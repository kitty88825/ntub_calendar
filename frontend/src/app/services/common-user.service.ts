import { CommonUser } from './../models/commonUser';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonUserService {


  resToken = '';
  reqHeader = new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
  });


  constructor(
    private http: HttpClient,
  ) {
  }

  getCommonUser(): Observable<CommonUser[]> {
    return this.http.get<CommonUser[]>(environment.serverIp + 'user/common', { headers: this.reqHeader });
  }
}
