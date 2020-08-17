import { Router } from '@angular/router';
import { MainCalendarComponent } from './../main-calendar/main-calendar.component';
import { TokenService } from './../services/token.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) { }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401 && localStorage.getItem('loggin') === 'true') {
          // 401 error so we are unauthorized

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
        } else if (localStorage.getItem('loggin') === null) {
          alert('請先登入系統');
          this.router.navigate(['/index']);
        } else if (error.status === 403) {
          alert('請使用北商google帳號登入');
          this.router.navigate(['/index']);
          window.location.reload();
        }

        return throwError(error);
      })
    );
  }


}
