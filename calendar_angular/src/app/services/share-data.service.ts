import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  constructor() { }

  private subject = new Subject<any>();
  private resToken = '';

  sendMessage(message: any) {
    this.subject.next({ message });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

}
