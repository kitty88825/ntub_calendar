import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { Token } from '../models/token.model';
import { AuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public isMenuCollapsed = true;
  resToken = '';
  authToken;
  loggedIn: boolean;
  data = {
    current: '1'
  };
  isCollapsed = false;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private authService: AuthService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;

  ngOnInit() { }

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (result) => {
        let timerInterval;
        Swal.fire({
          title: 'Loggin in',
          timer: 1500,
          onBeforeOpen: () => {
            Swal.showLoading(),
              timerInterval = setInterval(() => {
                const content = Swal.getContent();
                if (content) {
                  const b = content.querySelector('b');
                  if (b) {
                    b.textContent = Swal.getTimerLeft();
                  }
                }
              }, 100);
          },
          onClose: () => {
            clearInterval(timerInterval);
            this.router.navigate(['/calendar']);
          }
        });
        this.authService.authState.subscribe((user) => {
          this.authToken = user.authToken;
          localStorage.setItem('userName', user.name);
          localStorage.setItem('access_token', user.authToken);
          this.loggedIn = (user != null);
          console.log(this.authToken);
          console.log(this.loggedIn);
          const token: Token = {
            accessToken: this.authToken,
          };
          this.tokenService.postToken(token).subscribe(
            data => {
              this.resToken = data.token;
              localStorage.setItem('refresh_token', data.token);
              console.log(data.token);
            },
            error => {
              console.log(error);
            }
          );
        });
      }
    );
  }

  setCurrent(param) {
    this.data.current = param;
    console.log(param);
  }

}




