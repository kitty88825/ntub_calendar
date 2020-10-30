import { URLService } from './../services/url.service';
import { TokenService } from './../services/token.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss']
})
export class URLComponent implements OnInit {
  userURL = '';
  userEmail = '';
  formData = new FormData();

  constructor(
    private tokenService: TokenService,
    private urlService: URLService
  ) { }

  ngOnInit(): void {
    this.tokenService.getUser().subscribe(
      data => {
        this.userURL = data.url;
        this.userEmail = data.email;
      }
    );
  }

  /* To copy Text from Textbox */
  copyInputMessage(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    Swal.fire({
      text: '已複製',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  }

  renewURL() {
    this.formData.append('email', this.userEmail);
    this.urlService.postRenewURL(this.formData).subscribe(
      data => {
        this.userURL = data.url;
      }
    );
  }

}
