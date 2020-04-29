import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private http: HttpClient
    ) { }

  getData(): Observable<any[]> {
    const data = [
      {
        id: '1',
        title: 'Meeting',
        start: '2020-04-25'
      }
    ];

    return of(data);
  }
}
