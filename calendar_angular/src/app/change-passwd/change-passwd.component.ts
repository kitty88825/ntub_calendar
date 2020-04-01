import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';


@Component({
  selector: 'app-change-passwd',
  templateUrl: './change-passwd.component.html',
  styleUrls: ['./change-passwd.component.scss']
})
export class ChangePasswdComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login() {
    Swal.fire({
      text: '密碼更新成功',
      icon: 'success',
    });
    this.router.navigate(['/login']);
  }

}
