import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { Token } from '../models/token.model';
import { AuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  serverIp = 'http://127.0.0.1:8000/api/v1/';

  public isMenuCollapsed = true;
  resToken = '';
  authToken;
  loggedIn: boolean;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private authService: AuthService,
  ) { }

  ngOnInit() { }

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (result) => {
        let timerInterval;
        Swal.fire({
          title: 'Logging in',
          timer: 1000,
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

}




