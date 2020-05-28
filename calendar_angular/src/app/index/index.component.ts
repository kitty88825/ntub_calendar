import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { Token } from '../models/token.model';
import { ShareDataService } from '../services/share-data.service';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  auth2: any;
  public isMenuCollapsed = true;
  resToken = '';


  @ViewChild('loginRef', { static: true }) loginElement: ElementRef;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private shareDataService: ShareDataService
  ) { }

  ngOnInit() {
    this.googleSDK();
  }


  prepareLoginButton() {

    this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
      (googleUser) => {
        const profile = googleUser.getBasicProfile();
        const token: Token = {
          accessToken: googleUser.getAuthResponse().access_token,
        };
        this.tokenService.postToken(token).subscribe(
          data => {
            this.resToken = data.token;
            console.log(data.token);
            this.shareDataService.sendToken(data.token);
          },
          error => {
            console.log(error);
          }
        );
        // console.log('Token || ' + googleUser.getAuthResponse().access_token);
        // console.log('ID: ' + profile.getId());
        // console.log('Name: ' + profile.getName());
        // console.log('Image URL: ' + profile.getImageUrl());
        // console.log('Email: ' + profile.getEmail());
      }, (error) => {
        // alert(JSON.stringify(error, undefined, 2));
      });

  }
  googleSDK() {

    // tslint:disable-next-line: no-string-literal
    window['googleSDKLoaded'] = () => {
      // tslint:disable-next-line: no-string-literal
      window['gapi'].load('auth2', () => {
        // tslint:disable-next-line: no-string-literal
        this.auth2 = window['gapi'].auth2.init({
          client_id: '1035929255551-0a4248ua8cabhe19s8v946td1i211u5r.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
          scope: 'profile email'
        });
        this.prepareLoginButton();
      });
    };

    // tslint:disable-next-line: only-arrow-functions
    (function (d, s, id) {
      // tslint:disable-next-line: one-variable-per-declaration
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = 'https://apis.google.com/js/platform.js?onload=googleSDKLoaded';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'google-jssdk'));

  }



}
