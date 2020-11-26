import { Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
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
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  isCollapsed = false;
  token: Token;
  resToken = '';
  authToken = '';
  loggedIn: boolean;
  showModal: boolean;
  showEvent: boolean;
  selectYear = String(new Date().getFullYear());
  selectMonth = '';
  eventsYear = [];
  eventsMonth = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  publicEvents = [];
  publicCalendar = [];
  showEvents = [];
  initShowEvents = [];
  opendataDatas = [];
  views = { current: '1' };
  header = ['學年度', '設立別', '學校類別', '學校代碼', '學校名稱', '學期別', '起始日期', '結束日期', '性質', '類別', '對象', '說明'];
  searchText = '';
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  eventTitle = '';
  eventStart = '';
  eventEnd = '';
  eventDescription = '';
  eventOffice = '';
  eventParticipant = '';
  eventFile = '';
  eventLocation = '';
  IsLoadingEnd: boolean;
  Loading: boolean;

  @ViewChild('ngxLoading', { static: false }) ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public coloursEnabled = false;
  public loadingTemplate: TemplateRef<any>;
  public config = {
    animationType: ngxLoadingAnimationTypes.none,
    primaryColour: this.primaryColour, secondaryColour: this.secondaryColour,
    tertiaryColour: this.primaryColour, backdropBorderRadius: '3px'
  };

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService,
    private calendarService: CalendarService,
    private eventService: EventService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  ngOnInit() {
    this.loading = !this.loading;
    this.selectMonth = this.todayDate.substr(5, 2);
    this.eventsYear.push(this.todayDate.substr(0, 4));

    this.calendarService.fGetCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.publicCalendar.push({
            id: calendar.id, name: calendar.name,
            description: calendar.description, display: calendar, color: calendar.color
          });
        });
      }
    );

    this.eventService.fGetEvents().subscribe(
      data => {
        data.forEach(event => {
          this.publicEvents.push({
            id: event.id, title: event.title, start: event.startAt, participants: event.eventparticipantSet,
            end: event.endAt, startDate: event.startAt.substr(0, 10), location: event.location,
            endDate: event.endAt.substr(0, 10), description: event.description, sTime: event.startAt.substring(11, 16),
            eTime: event.endAt.substring(11, 16), files: event.attachments,
            backgroundColor: event.eventinvitecalendarSet[0].mainCalendar.color,
            mainCalendarName: event.eventinvitecalendarSet[0].mainCalendar.name
          });
        });

        this.calendarEvents = this.publicEvents;

        this.publicEvents.forEach(event => {
          this.eventsYear.push(event.startDate.substr(0, 4));

          if (Number(event.startDate.substr(6, 2)) <= 7) {
            this.opendataDatas.push([String(Number(event.startDate.substr(0, 4)) - 1911),
              '公立', '技專校院', '0051', '國立台北商業大學', '1', event.startDate,
            event.endDate, '', '', '', event.title]);
          } else {
            this.opendataDatas.push([String(Number(event.startDate.substr(0, 4)) - 1911),
              '公立', '技專校院', '0051', '國立台北商業大學', '2', event.startDate,
            event.endDate, '', '', '', event.title]);
          }
        });

        this.showEventsChange();
        this.showEventsSort();
        this.eventsYearFilter();
        this.eventYearSort();
        this.loading = false;
      }
    );
  }

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (data) => {
        this.authService.authState.subscribe((user) => {
          this.loading = !this.loading;
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
          this.loading = !this.loading;
          this.resToken = data.token.access;
          localStorage.setItem('staff', String(data.staff));
          localStorage.setItem('res_access_token', this.resToken);
          localStorage.setItem('res_refresh_token', data.token.refresh);

          setTimeout(() => {
            if (localStorage.getItem('res_access_token').length !== null) {
              this.loading = !this.loading;
              this.router.navigate(['/calendar']);
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
          }, 1000);
        }
      );
    });

  }

  lookEventDetail(event) {
    this.showEvent = true;
    this.eventTitle = event.title;
    this.eventStart = event.startDate + ' ' + event.sTime;
    this.eventEnd = event.endDate + ' ' + event.eTime;
    this.eventDescription = event.description;
    this.eventOffice = event.mainCalendarName;
    this.eventParticipant = event.participants.length + '人';
    this.eventFile = event.files.length + '個';
    this.eventLocation = event.location;
  }

  eventClick(info) {
    this.showEvent = true;
    this.eventTitle = info.event._def.title;
    this.eventStart = info.event._def.extendedProps.startDate + ' ' + info.event._def.extendedProps.sTime;
    this.eventEnd = info.event._def.extendedProps.endDate + ' ' + info.event._def.extendedProps.eTime;
    this.eventDescription = info.event._def.extendedProps.description;
    this.eventOffice = info.event._def.extendedProps.mainCalendarName;
    this.eventParticipant = info.event._def.extendedProps.participants.length + '人';
    this.eventFile = info.event._def.extendedProps.files.length + '個';
    this.eventLocation = info.event._def.extendedProps.location;
  }

  setCurrent(param) {
    this.views.current = param;
  }

  daochu(info) {
    const output = [];
    output.push(this.header);
    this.opendataDatas.forEach(data => {
      output.push(data);
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(output);
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
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, '台北商業大學.' + info.target.innerText);
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
    this.showEventsChange();
    this.showEventsSort();
  }

  eventsYearFilter() {
    this.eventsYear = this.eventsYear.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });
  }

  eventYearSort() {
    this.eventsYear.sort((a, b) => {
      const startA = a;
      const startB = b;
      if (startA < startB) {
        return 1;
      }
      if (startA > startB) {
        return -1;
      }
      return 0;
    });
  }

  showEventsSort() {
    this.showEvents.sort((a, b) => {
      const startA = a.start.toUpperCase();
      const startB = b.start.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

  showEventsChange() {
    this.publicEvents.forEach(event => {
      if (event.startDate.substr(0, 4) === this.selectYear && event.startDate.substr(5, 2) === this.selectMonth) {
        this.showEvents.push(event);
      }
    });
    this.showEventsSort();
  }

  toggleColours(): void {
    this.coloursEnabled = !this.coloursEnabled;

    if (this.coloursEnabled) {
      this.primaryColour = PrimaryRed;
      this.secondaryColour = SecondaryBlue;
    } else {
      this.primaryColour = PrimaryWhite;
      this.secondaryColour = SecondaryGrey;
    }
  }

}




