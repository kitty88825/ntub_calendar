import { UserCommon } from './../models/user-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserCommonService {
  serverIp = 'http://140.131.114.144/api/v1/';
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postCommonUser(formData: any): Observable<any> {
    return this.http.post<any>(this.serverIp + 'user/common', formData, { headers: this.reqHeader });
  }

  getCommonUsers(): Observable<UserCommon[]> {
    return this.http.get<UserCommon[]>(this.serverIp + 'user/common', { headers: this.reqHeader });
  }

  deleteCommonUser(id: number): Observable<UserCommon> {
    return this.http.delete<UserCommon>(`${this.serverIp}user/common/${id}`, { headers: this.reqHeader });
  }
}
