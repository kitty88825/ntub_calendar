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
    private tokenService: TokenService
  ) { }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401) {
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
        }

        return throwError(error);
      })
    );
  }


}
