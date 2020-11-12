import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { AuthService } from 'angularx-social-login';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userName = '';
  staff = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName').substr(0, 1);
    this.staff = localStorage.getItem('staff');
  }

  addCalendar() {
    if (this.staff === 'true') {
      this.router.navigate(['/add-calendar']);
    } else if (this.staff === 'false') {
      this.router.navigate(['/add-calendar-unstaff']);
    }
  }

  logout() {
    Swal.fire({
      text: '是否確定要登出？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.authService.signOut();
        localStorage.removeItem('res_refresh_token');
        localStorage.removeItem('res_access_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('loggin');
        localStorage.removeItem('userName');
        localStorage.removeItem('staff');
        this.router.navigate(['/index']);
      }
    });
  }

}
