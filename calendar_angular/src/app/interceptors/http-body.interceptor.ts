import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';

import { camelize, decamelize } from '@ridi/object-case-converter';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpBodyInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next
      .handle(
        req.clone({ body: decamelize(req.body, { recursive: true }) }),
      )
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            return event.clone({ body: camelize(event.body, { recursive: true }) });
          }

          return event;
        }),
      );
  }

}
