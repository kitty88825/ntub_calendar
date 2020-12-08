import { TokenService } from './../../services/token.service';
import { CalendarService } from './../../services/calendar.service';
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
  group = [];
  role;
  permission = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private calendarService: CalendarService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName').substr(0, 1);
    this.staff = localStorage.getItem('staff');
    this.tokenService.getUser().subscribe(
      data => {
        this.role = data.role;
        this.group = data.groups;
      }
    );
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(res => {
          res.permissions.forEach(permission => {
            if (this.group.includes(permission.group) && this.role === permission.role && permission.authority === 'write') {
              this.permission = 'true';
              localStorage.setItem('permission', 'true');
            }
          });
        });
      }
    );
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
        localStorage.clear();
        this.router.navigate(['']).then((a) => {
          window.location.reload();
        });
      }
    });
  }

}
