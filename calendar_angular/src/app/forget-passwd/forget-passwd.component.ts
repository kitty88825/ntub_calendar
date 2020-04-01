import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-forget-passwd',
  templateUrl: './forget-passwd.component.html',
  styleUrls: ['./forget-passwd.component.scss']
})
export class ForgetPasswdComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  enter() {
    this.router.navigate(['/change-passwd']);
  }

  submit() {
    Swal.fire({
      text: '請至信箱收取驗證碼',
      icon: 'success'
    });
  }

}
