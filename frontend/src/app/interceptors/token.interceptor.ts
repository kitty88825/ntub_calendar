import { Router } from '@angular/router';
import { TokenService } from './../services/token.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {
  }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 && localStorage.getItem('loggin') === 'true') {

          // refresh the access token
          const refreshToken = {
            refresh: localStorage.getItem('res_refresh_token'),
          };
          this.tokenService.refreshToken(refreshToken).subscribe(
            data => {
              localStorage.setItem('res_access_token', data.access);
              window.location.reload();
            },
            err => {
              console.log(err);
            }
          );

          // 401 error so we are unauthorized
          window.location.reload();
        } else if (localStorage.getItem('loggin') === null && localStorage.getItem('url') === null) {
          localStorage.setItem('url', window.location.hash.substr(2));
          this.router.navigate(['']);
        } else if (localStorage.getItem('url') !== null) {
          this.router.navigate(['']);
        } else if (localStorage.getItem('loggin') === 'true' && error.status === 403) {
          alert('您沒有權限進行操作');
        }

        return throwError(error);
      })
    );
  }


}
