import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  cancle() {
    this.router.navigate(['/login']);
  }

  success() {
    Swal.fire({
      text: '註冊成功',
      icon: 'success'
    });
    this.router.navigate(['/login']);
  }

}
