import { TokenService } from './../services/token.service';
import { Component, ViewChild, OnInit, HostListener, TemplateRef } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { ShareDataService } from '../services/share-data.service';
import { CalendarService } from '../services/calendar.service';
import { formatDate } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.scss']
})
export class MainCalendarComponent implements OnInit {
  searchText = '';
  eventsYear = [];
  selectYear = String(new Date().getFullYear());
  eventsMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectAll: boolean;
  publicCalendar = [];
  pageSize = 9;
  page = 1;
  data = { current: '1' };
  isCollapsed = false;
  isOpen = false;
  isTrue = false;
  showEvent: boolean;
  events = [];
  eventTitle = '';
  eventStart = '';
  eventEnd = '';
  eventOffice = '';
  eventLocation = '';
  eventDescription = '';
  eventParticipant = '';
  eventFile = '';
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  selectMonth = Number(this.todayDate.substr(5, 2));
  group = [];
  formData = new FormData();
  deleteData = [];
  role = '';
  IsLoadingEnd: boolean;
  Loading: boolean;
  showEvents = [];
  initShowEvents = [];
  permission: boolean;
  staff = localStorage.getItem('staff');
  lookEvent = { id: 0, title: '' };

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
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private tokenService: TokenService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes = [];

  hiddenCalendarEvents = [];

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

    if (MainCalendarComponent.getScrollTop() + MainCalendarComponent.getClientHeight() === MainCalendarComponent.getScrollHeight()
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

  eventClick(info) {
    this.showEvent = true;
    this.lookEvent.id = info.event._def.publicId;
    this.lookEvent.title = info.event._def.title;
    this.eventTitle = info.event._def.title;
    this.eventStart = info.event._def.extendedProps.startDate + ' ' + info.event._def.extendedProps.sTime;
    this.eventEnd = info.event._def.extendedProps.endDate + ' ' + info.event._def.extendedProps.eTime;
    this.eventDescription = info.event._def.extendedProps.description;
    this.eventOffice = info.event._def.extendedProps.mainCalendarName;
    this.eventParticipant = info.event._def.extendedProps.participants.length + '人';
    this.eventFile = info.event._def.extendedProps.files.length + '個';
    this.eventLocation = info.event._def.extendedProps.location;
    this.permission = info.event._def.extendedProps.permission;
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

  displayType(eventType: any): void {

    eventType.selected = !eventType.selected;
    const calendarEvents = this.calendarEvents.slice();

    if (eventType.selected === true) {
      const calendarEventsToShow: any[] = [];

      // Show
      this.hiddenCalendarEvents
        .filter(calendarEvent => {
          if (calendarEvent.calendar[0].mainCalendar.id === eventType.id) {
            return true;
          }
        })
        .forEach(calendarEvent => {
          calendarEvents.push(JSON.parse(JSON.stringify(calendarEvent)));
          calendarEventsToShow.push(calendarEvent.id);
        });

      calendarEventsToShow.forEach(calendarEventToShow => {
        const index = this.hiddenCalendarEvents.findIndex(hiddenCalendarEvent => hiddenCalendarEvent.id === calendarEventToShow);
        this.hiddenCalendarEvents.splice(index, 1);
      });

    } else {
      const calendarEventsToHide: any[] = [];

      // Hide
      calendarEvents
        .filter(calendarEvent => {
          if (calendarEvent.calendar[0].mainCalendar.id === eventType.id) {
            return true;
          }
        })
        .forEach(calendarEvent => {
          if (this.calendarComponent.getApi().getEventById(String(calendarEvent.id))) {
            this.calendarComponent
              .getApi()
              .getEventById(String(calendarEvent.id))
              .remove();
          }

          this.hiddenCalendarEvents.push(JSON.parse(JSON.stringify(calendarEvent)));
          calendarEventsToHide.push(calendarEvent.calendar[0].mainCalendar.id);
        });

      calendarEventsToHide.forEach(calendarEventToHide => {
        const index = calendarEvents.findIndex(calendarEvent => {
          return calendarEvent.calendar[0].mainCalendar.id === calendarEventToHide;
        });

        calendarEvents.splice(index, 1);

      });
    }

    this.calendarEvents = calendarEvents;
    this.events = calendarEvents;

    this.onChange();
  }

  ngOnInit() {
    this.loading = !this.loading;
    this.eventsYear.push(this.todayDate.substr(0, 4));

    this.tokenService.getUser().subscribe(
      re => {
        this.group = re.groups;
        this.role = re.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      result => {
        result.forEach(calendar => {
          this.publicCalendar.push({
            id: calendar.id, name: calendar.name,
            description: calendar.description, display: calendar.display,
            color: calendar.color, permission: calendar.permissions
          });

          this.eventTypes.push({ title: 'type' + calendar.id, id: calendar.id, selected: true });
        });
      }
    );

    this.eventService.getEvents().subscribe(
      data => {
        data.forEach(event => {
          this.events.push({
            id: event.id, title: event.title, start: event.startAt, calendar: event.eventinvitecalendarSet,
            end: event.endAt, startDate: event.startAt.substr(0, 10), location: event.location,
            endDate: event.endAt.substr(0, 10), description: event.description,
            backgroundColor: event.eventinvitecalendarSet[0].mainCalendar.color,
            sTime: event.startAt.substring(11, 16), eTime: event.endAt.substring(11, 16),
            participants: event.eventparticipantSet, files: event.attachments, permission: false,
            isChecked: false, mainCalendarName: event.eventinvitecalendarSet[0].mainCalendar.name
          });
        });

        this.calendarEvents = this.events;

        this.events.forEach(event => {
          this.eventsYear.push(event.startDate.substr(0, 4));
        });

        this.group.forEach(group => {
          this.events.forEach(event => {
            if (event.calendar[0].mainCalendar.permissions.length !== 0 &&
              Number(group) === event.calendar[0].mainCalendar.permissions[0].group &&
              this.role === event.calendar[0].mainCalendar.permissions[0].role &&
              event.calendar[0].mainCalendar.permissions[0].authority === 'write') {
              event.permission = true;
            }
          });
        });

        this.eventsYearFilter();
        this.showEventsChange();
        this.showEventsSort();

        this.loading = false;
      }
    );

  }

  setCurrent(param) {
    this.data.current = param;
  }

  delete(info) {
    Swal.fire({
      text: '確定要刪除「' + info.title + '」?',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.eventService.deleteEvent(info.id).subscribe(
          data => {
            const index = this.calendarEvents.indexOf(info.id);
            this.calendarEvents.splice(index, 1);
            this.calendarComponent
              .getApi()
              .getEventById(String(info.id))
              .remove();
            Swal.fire({
              text: '已刪除',
              icon: 'success',
            }).then((re) => {
              window.location.reload();
            });
          },
          error => {
            Swal.fire({
              text: '刪除失敗',
              icon: 'error',
            });
          }
        );
      }
    });
  }

  edit(info) {
    let editEvent;
    this.eventService.getEvent(info.id).subscribe(
      data => {
        editEvent = data;
        this.shareDataService.sendMessage(editEvent);
      }
    );
    this.router.navigate(['/edit-schedule']);
  }

  hide() {
    this.showEvent = false;
  }

  checkAll() {
    this.deleteData.length = 0;

    if (this.selectAll === true) {
      this.initShowEvents.forEach(init => {
        init.isChecked = true;
      });
    } else {
      this.initShowEvents.forEach(init => {
        init.isChecked = false;
      });
    }

    this.initShowEvents.forEach(init => {
      if (init.permission === true && init.isChecked === true) {
        this.deleteData.push(init.id);
      }
    });
  }

  changeSelection() {
    let count = 0;
    let permissionCount = 0;
    this.deleteData = [];

    this.initShowEvents.forEach(init => {
      if (init.isChecked === true) {
        count++;
      }
      if (init.permission === true) {
        permissionCount++;
      }

      if (init.permission === true && init.isChecked === true) {
        this.deleteData.push(init.id);
      }

    });

    if (permissionCount === count) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  deleteAll() {
    Swal.fire({
      text: '確定要刪除' + this.deleteData.length + '筆資料?',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.deleteData.forEach(deleteData => {
          this.eventService.deleteEvent(deleteData).subscribe(
            data => {
              const index = this.calendarEvents.indexOf(deleteData);
              this.calendarEvents.splice(index, 1);
              this.calendarComponent
                .getApi()
                .getEventById(String(deleteData))
                .remove();
              Swal.fire({
                text: '刪除成功',
                icon: 'success',
              }).then((res) => {
                window.location.reload();
              });
            }
          );
        });
      }
    });
  }

  onChange() {
    this.showEvents = [];
    this.initShowEvents = [];
    this.showEventsChange();
    this.showEventsSort();
  }

  showEventsSort() {
    this.showEvents = this.showEvents.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    this.showEvents.sort((a, b) => {
      const startA = a.startDate.toUpperCase();
      const startB = b.startDate.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

  eventsYearFilter() {
    this.eventsYear = this.eventsYear.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

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

  showEventsChange() {
    this.events.forEach(event => {
      if (event.startDate.substr(0, 4) === this.selectYear
        && Number(event.startDate.substr(5, 2)) === this.selectMonth) {
        this.showEvents.push(event);
      }
    });
    this.showEventsSort();

    if (this.showEvents.length > this.pageSize) {
      this.initShowEvents = this.showEvents.slice();
      this.showEvents = [];
      for (let i = 0; i < this.pageSize; i++) {
        this.showEvents.push(this.initShowEvents[i]);
      }
      this.IsLoadingEnd = false;
    } else {
      this.initShowEvents = this.showEvents.slice();
    }
  }



}
