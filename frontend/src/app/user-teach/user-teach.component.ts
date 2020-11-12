import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-teach',
  templateUrl: './user-teach.component.html',
  styleUrls: ['./user-teach.component.scss']
})
export class UserTeachComponent implements OnInit {

  data = {current: '1'};
  loggin = '';

  constructor() { }

  ngOnInit(): void {
    this.loggin = localStorage.getItem('loggin');
  }

  setCurrent(param) {
    this.data.current = param;
  }

}
