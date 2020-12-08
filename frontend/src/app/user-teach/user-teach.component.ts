import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-teach',
  templateUrl: './user-teach.component.html',
  styleUrls: ['./user-teach.component.scss']
})
export class UserTeachComponent implements OnInit {

  data = { current: '1' };
  isCollapsed: boolean;
  isTrue: boolean;
  loggin = '';
  permission = localStorage.getItem('permission');

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggin = localStorage.getItem('loggin');
  }

  setCurrent(param) {
    this.data.current = param;
  }

}
