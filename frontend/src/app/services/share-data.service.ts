import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  constructor() { }

  private subject = new Subject<any>();

  sendMessage(message: any) {
    this.subject.next({ message });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }


}
