import { environment } from './../../environments/environment';
import { UserCommon } from './../models/user-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserCommonService {
  reqHeader;


  constructor(
    private http: HttpClient,
  ) {
    this.reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('res_access_token')
    });
  }

  postCommonUser(formData: any): Observable<any> {
    return this.http.post<any>(environment.serverIp + 'user/common', formData, { headers: this.reqHeader });
  }

  getCommonUsers(): Observable<UserCommon[]> {
    return this.http.get<UserCommon[]>(environment.serverIp + 'user/common', { headers: this.reqHeader });
  }

  deleteCommonUser(id: number): Observable<UserCommon> {
    return this.http.delete<UserCommon>(`${environment.serverIp}user/common/${id}`, { headers: this.reqHeader });
  }

  patchCommonUser(id: number, formData: any): Observable<UserCommon> {
    return this.http.patch<UserCommon>(`${environment.serverIp}user/common/${id}`, formData, { headers: this.reqHeader });
  }

}
