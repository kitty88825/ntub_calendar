import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { Token } from '../models/token.model';
import { AuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarService } from '../services/calendar.service';
import { EventService } from '../services/event.service';
import * as XLSX from 'xlsx';

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
  showModal: boolean;
  data = {
    current: '1'
  };
  isCollapsed = false;
  showDatas = [];
  header = ['學年度', '設立別', '學校類別', '學校代碼', '學校名稱', '學期別', '起始日期', '結束日期', '性質', '類別', '對象', '說明'
  ];
  output = [];

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private authService: AuthService,
    private calendarService: CalendarService,
    private eventService: EventService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;

  ngOnInit() {
    this.calendarService.getCalendar().subscribe(
      data => {
        console.log(data);
      }
    );
  }

  async signInWithGoogle() {
    await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (result) => {
        this.authService.authState.subscribe((user) => {
          this.authToken = user.authToken;
          localStorage.setItem('userName', user.name);
          localStorage.setItem('access_token', user.authToken);
          this.loggedIn = (user != null);
          console.log(this.authToken);
          console.log(this.loggedIn);
          localStorage.setItem('loggin', String(this.loggedIn));
          const token: Token = {
            accessToken: this.authToken,
          };
          this.tokenService.postToken(token).subscribe(
            data => {
              console.log(data.token);
              this.resToken = data.token.access;
              localStorage.setItem('res_access_token', this.resToken);
              localStorage.setItem('res_refresh_token', data.token.refresh);
            },
            error => {
              console.log(error);
            }
          );
        });
      }
    );
    let timerInterval;

    Swal.fire({
      title: 'Loggin in...',
      timer: 5000,
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
        if (localStorage.getItem('res_access_token') != null) {
          this.router.navigate(['/calendar']);
        } else {
          window.location.reload();
          if (localStorage.getItem('res_access_token') != null) {
            this.router.navigate(['/calendar']);
          }
        }
      }
    });
  }

  setCurrent(param) {
    this.data.current = param;
    console.log(param);
  }

  logout() {
    this.authService.signOut();
    localStorage.removeItem('res_refresh_token');
    localStorage.removeItem('res_access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('loggin');
  }

  // 匯出
  daochu(info) {
    console.log(info);
    this.output.push(this.header);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.showDatas.length; i++) {
      this.output.push(this.showDatas[i]);
    }
    console.log(this.output);
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.output);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'demo.' + info.target.innerText);
  }


  hide() {
    this.showModal = false;
  }

  openData() {
    this.showModal = true;
  }


}




