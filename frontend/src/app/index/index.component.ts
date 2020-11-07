import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
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
import { EventInput } from '@fullcalendar/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  pageSize = 9;
  resToken = '';
  isCollapsed = false;
  authToken;
  loggedIn: boolean;
  showModal: boolean;
  showEvent: boolean;
  selectYear = String(new Date().getFullYear());
  eventsYear = [];
  eventsMonth = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  showEvents = [];
  selectMonth = '';
  data = {
    current: '1'
  };
  showDatas = [];
  header = ['學年度', '設立別', '學校類別', '學校代碼', '學校名稱', '學期別', '起始日期', '結束日期', '性質', '類別', '對象', '說明'
  ];
  output = [];
  events = [];
  openCalendar = [];
  searchText = '';
  searchTextSmall = '';
  searchTextGrid = '';
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  eventTitle; eventStart; eventEnd; eventDescription; eventOffice;
  eventParticipant; eventFile; eventLocation;
  token: Token;
  page = 1;
  IsLoadingEnd;
  Loading;
  initShowEvents = [];

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
  calendarEvents: EventInput[];

  static getScrollTop(): number {
    let scrollTop = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
      scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
      scrollTop = document.body.scrollTop;
    }
    return scrollTop;
  }

  static getClientHeight(): number {
    let clientHeight = 0;
    if (document.body.clientHeight && document.documentElement.clientHeight) {
      clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
    } else {
      clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
    }
    return clientHeight;
  }

  static getScrollHeight(): number {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    if (IndexComponent.getScrollTop() + IndexComponent.getClientHeight() === IndexComponent.getScrollHeight()
      && this.IsLoadingEnd === false) {
      this.Loading = true;
      this.page = this.page + 1;
      if (this.page * this.pageSize - this.initShowEvents.length <= 0) {
        this.IsLoadingEnd = false;
        this.showEvents = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.page * this.pageSize; i++) {
          this.showEvents.push(this.initShowEvents[i]);
        }
      } else {
        this.IsLoadingEnd = true;
        this.showEvents = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.initShowEvents.length; i++) {
          this.showEvents.push(this.initShowEvents[i]);
        }
      }
    }
  }

  ngOnInit() {
    this.selectMonth = this.todayDate.substr(5, 2);

    this.calendarService.fGetCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.openCalendar.push({
            id: calendar.id, name: calendar.name,
            description: calendar.description, display: calendar, color: calendar.color
          });
        });
      }
    );

    this.eventService.fGetEvents().subscribe(
      data => {
        data.forEach(event => {
          this.events.push({
            id: event.id, title: event.title, start: event.startAt, eventinvitecalendarSet: event.eventinvitecalendarSet,
            end: event.endAt, startDate: event.startAt.substr(0, 10), location: event.location,
            endDate: event.endAt.substr(0, 10), description: event.description, sTime: event.startAt.substring(11, 16),
            eTime: event.endAt.substring(11, 16), files: event.attachments,
            backgroundColor: event.eventinvitecalendarSet[0].mainCalendar.color,
            mainCalendarName: event.eventinvitecalendarSet[0].mainCalendar.name
          });
        });

        this.eventsSort();

        this.calendarEvents = this.events;

        this.events.forEach(event => {
          this.eventsYear.push(event.startDate.substr(0, 4));

          if (event.startDate.substr(0, 4) === this.selectYear && event.startDate.substr(5, 2) === this.selectMonth) {
            this.showEvents.push(event);
          }

          if (Number(event.startDate.substr(6, 2)) <= 7) {
            this.showDatas.push([String(Number(event.startDate.substr(0, 4)) - 1911),
              '公立', '技專校院', '0051', '國立台北商業大學', '1', event.startDate,
            event.endDate, '', '', '', event.title]);
          } else {
            this.showDatas.push([String(Number(event.startDate.substr(0, 4)) - 1911),
              '公立', '技專校院', '0051', '國立台北商業大學', '2', event.startDate,
            event.endDate, '', '', '', event.title]);
          }
        });

        // tslint:disable-next-line: only-arrow-functions
        this.eventsYear = this.eventsYear.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        this.showEventsSort();

        // tslint:disable-next-line: only-arrow-functions
        this.eventsYear.sort(function (a, b) {
          const startA = a; // ignore upper and lowercase
          const startB = b; // ignore upper and lowercase
          if (startA < startB) {
            return -1;
          }
          if (startA > startB) {
            return 1;
          }
          return 0;
        });

        if (this.showEvents.length > this.pageSize) {
          this.initShowEvents = this.showEvents.slice();
          this.showEvents = [];
          for (let i = 0; i < this.pageSize; i++) {
            this.showEvents.push(this.initShowEvents[i]);
          }
          this.IsLoadingEnd = false;
        }

      }
    );

  }

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (result) => {
        this.authService.authState.subscribe((user) => {
          this.authToken = user.authToken;
          localStorage.setItem('userName', user.name);
          localStorage.setItem('access_token', user.authToken);
          this.loggedIn = (user != null);
          localStorage.setItem('loggin', String(this.loggedIn));
          this.token = {
            accessToken: this.authToken,
          };
        });
      }
    ).then((result) => {
      this.tokenService.postToken(this.token).subscribe(
        data => {
          this.resToken = data.token.access;
          localStorage.setItem('staff', String(data.staff));
          localStorage.setItem('res_access_token', this.resToken);
          localStorage.setItem('res_refresh_token', data.token.refresh);

          if (this.resToken != null) {
            Swal.fire({
              title: 'Loggin in',
              timer: 5000,
              onBeforeOpen: () => {
                Swal.showLoading();
              },
              onClose: () => {
                this.router.navigate(['/calendar']);
              }
            });
          } else {
            Swal.fire({
              text: '請重新登入！',
              icon: 'error'
            }).then((re) => {
              if (re.value) {
                window.location.reload();
              }
            });
          }
        }
      );
    });


  }

  eventClick(info) {
    this.showEvent = true;
    this.eventTitle = info.event._def.title;
    this.eventStart = info.event._def.extendedProps.startDate + ' ' + info.event._def.extendedProps.sTime;
    this.eventEnd = info.event._def.extendedProps.endDate + ' ' + info.event._def.extendedProps.eTime;
    this.eventDescription = info.event._def.extendedProps.description;
    this.eventOffice = info.event._def.extendedProps.calendar.mainCalendarName;
    this.eventParticipant = info.event._def.extendedProps.participants;
    this.eventFile = info.event._def.extendedProps.files.length;
    this.eventLocation = info.event._def.extendedProps.location;
  }

  setCurrent(param) {
    this.data.current = param;
  }

  // 匯出
  daochu(info) {
    this.output = [];
    this.output.push(this.header);

    this.showDatas.forEach(data => {
      this.output.push(data);
    });

    /* generate worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.output);
    const wscols = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 100 },
    ];
    ws['!cols'] = wscols;

    /* generate workbook and add the worksheet */
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'demo.' + info.target.innerText);
  }


  hideExcel() {
    this.showModal = false;
  }

  hideEvent() {
    this.showEvent = false;
  }

  openData() {
    this.showModal = true;
  }

  onChange() {
    this.showEvents = [];
    this.events.forEach(event => {
      if (event.startDate.substr(0, 4) === this.selectYear && event.startDate.substr(5, 2) === this.selectMonth) {
        this.showEvents.push(event);
      }
    });

    if (this.showEvents.length > this.pageSize) {
      this.initShowEvents = this.showEvents.slice();
      this.showEvents = [];
      for (let i = 0; i < this.pageSize; i++) {
        this.showEvents.push(this.initShowEvents[i]);
      }
      this.IsLoadingEnd = false;
    } else {
      this.IsLoadingEnd = true;
    }

  }

  eventsSort() {
    // tslint:disable-next-line: only-arrow-functions
    this.events.sort(function(a, b) {
      const startA = a.start.toUpperCase(); // ignore upper and lowercase
      const startB = b.start.toUpperCase(); // ignore upper and lowercase
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

  showEventsSort() {
    // tslint:disable-next-line: only-arrow-functions
    this.showEvents.sort(function(a, b) {
      const startA = a.start.toUpperCase(); // ignore upper and lowercase
      const startB = b.start.toUpperCase(); // ignore upper and lowercase
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

}




