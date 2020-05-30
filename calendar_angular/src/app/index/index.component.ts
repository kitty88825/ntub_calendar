import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TokenService } from '../services/token.service';
import { Token } from '../models/token.model';
import { AuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

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

  ngOnInit() {}

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (result) => {
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
              this.router.navigate(['/calendar']);
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




