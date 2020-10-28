import { TokenService } from './../services/token.service';
import { Component, ViewChild, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { ShareDataService } from '../services/share-data.service';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.scss']
})
export class MainCalendarComponent implements OnInit {
  user = true;
  official = !this.user;
  searchText = '';
  searchTextSmall = '';
  searchTextGrid = '';
  put;
  title;
  eventsYear = [];
  selectAll: boolean;
  selectYear = String(new Date().getFullYear());
  eventsMonth = [];
  selectMonth = '';
  openCalendar = [];
  calendars = [];
  mySub = [];
  pageSize = 9;
  data = {
    current: '1'
  };
  isCollapsed = false;
  showEvent: boolean;
  events = [];
  event; eventTitle; eventStart; eventEnd; eventOffice; eventLocation;
  eventDescription; eventParticipant; eventFile;
  calendarName = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  editPermission: boolean;
  deletePermission: boolean;
  group = [];
  unSelectedItemsList = [];
  formData = new FormData();
  deleteData = [];
  role = '';
  IsLoadingEnd;
  Loading;
  showEvents = [];
  page = 1;
  initShowEvents = [];

  constructor(
    private router: Router,
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
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
    this.eventTitle = info.event._def.title;
    this.eventStart = info.event._def.extendedProps.startDate + ' ' + info.event._def.extendedProps.sTime;
    this.eventEnd = info.event._def.extendedProps.endDate + ' ' + info.event._def.extendedProps.eTime;
    this.eventDescription = info.event._def.extendedProps.description;
    this.eventOffice = info.event._def.extendedProps.calendar.name;
    this.eventParticipant = info.event._def.extendedProps.participants;
    this.eventFile = info.event._def.extendedProps.files.length;
    this.eventLocation = info.event._def.extendedProps.location;
  }

  displayType(eventType: any): void {

    eventType.selected = !eventType.selected;
    const calendarEvents = this.calendarEvents.slice(); // a clone

    if (eventType.selected === true) {
      const calendarEventsToShow: any[] = [];

      // Show
      this.hiddenCalendarEvents
        .filter(calendarEvent => {
          if (calendarEvent.calendar.id === eventType.id) {
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
          if (calendarEvent.calendar.id === eventType.id) {
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
          calendarEventsToHide.push(calendarEvent.calendar.id);
        });

      calendarEventsToHide.forEach(calendarEventToHide => {
        const index = calendarEvents.findIndex(calendarEvent => {
          return calendarEvent.calendar.id === calendarEventToHide;
        });

        calendarEvents.splice(index, 1);

      });
    }

    this.calendarEvents = calendarEvents;
    this.events = calendarEvents;

    // tslint:disable-next-line: only-arrow-functions
    this.events.sort(function (a, b) {
      const startA = a.start.toUpperCase(); // ignore upper and lowercase
      const startB = b.start.toUpperCase(); // ignore upper and lowercase
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }

      // names must be equal
      return 0;
    });

    this.onChange();

  }

  ngOnInit() {
    this.selectMonth = this.todayDate.substr(5, 2);

    this.tokenService.getUser().subscribe(
      re => {
        console.log(re);
        this.group = re.groups;
        this.role = re.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          this.openCalendar.push({
            id: result[j].id, name: result[j].name,
            description: result[j].description, display: result[j].display,
            color: result[j].color, permission: result[j].permissions
          });

          this.eventTypes.push({ title: 'type' + result[j].id, id: result[j].id, selected: true });
        }
      }
    );

    this.eventService.getEvents().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {

          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < data[i].calendars.length; j++) {

            this.events.push({
              id: data[i].id, title: data[i].title, start: data[i].startAt, calendar: data[i].calendars[j],
              end: data[i].endAt, startDate: data[i].startAt.substr(0, 10), location: data[i].location,
              endDate: data[i].endAt.substr(0, 10), description: data[i].description,
              backgroundColor: data[i].calendars[j].color, calendars: data[i].calendars,
              sTime: data[i].startAt.substring(11, 16), eTime: data[i].endAt.substring(11, 16),
              participants: data[i].participants, files: data[i].attachments, permission: false,
              permissions: data[i].calendars[j].permissions, isChecked: false
            });

          }

        }

        this.calendarEvents = this.events;

        // tslint:disable-next-line: prefer-for-of
        for (let k = 0; k < this.group.length; k++) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.events.length; i++) {
            this.eventsYear.push(this.events[i].startDate.substr(0, 4));
            this.eventsMonth.push(this.events[i].startDate.substr(5, 2));

            if (this.events[i].startDate.substr(0, 4) === this.selectYear && this.events[i].startDate.substr(5, 2) === this.selectMonth) {
              this.showEvents.push(this.events[i]);
            }

            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < this.events[i].permissions.length; j++) {
              if (Number(this.group[k]) === this.events[i].permissions[j].group &&
                this.role === this.events[i].permissions[j].role &&
                this.events[i].permissions[j].authority === 'write') {
                this.events[i].permission = true;
              }
            }
          }
        }

        this.eventsYear = this.eventsYear.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        this.eventsMonth = this.eventsMonth.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.showEvents.sort(function (a, b) {
          const startA = a.start.toUpperCase(); // ignore upper and lowercase
          const startB = b.start.toUpperCase(); // ignore upper and lowercase
          if (startA < startB) {
            return -1;
          }
          if (startA > startB) {
            return 1;
          }

          // names must be equal
          return 0;
        });

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

          // names must be equal
          return 0;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.eventsMonth.sort(function (a, b) {
          const startA = a; // ignore upper and lowercase
          const startB = b; // ignore upper and lowercase
          if (startA < startB) {
            return -1;
          }
          if (startA > startB) {
            return 1;
          }

          // names must be equal
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

  setCurrent(param) {
    this.data.current = param;
  }

  delete(info) {
    console.log(info.title);
    Swal.fire({
      text: '確定要刪除「' + info.title + '」?',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
      // tslint:disable-next-line: no-shadowed-variable
    }).then((result) => {
      if (result.value) {
        // -----------------------------deleteEvent
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
    this.eventService.getEvent(info.id).subscribe(
      data => {
        console.log(data);
        this.put = data;
        this.title = data.title;
        this.shareDataService.sendMessage(this.put);
      }
    );
    this.router.navigate(['/edit-schedule']);
  }

  hide() {
    this.showEvent = false;
  }

  checkAll() {
    this.fetchSelectedItems();

    if (this.selectAll === true) {
      this.initShowEvents.forEach(init => {
        init.isChecked = true;
      });
    } else {
      this.initShowEvents.forEach(init => {
        init.isChecked = false;
      });
    }
  }

  changeSelection() {
    this.fetchSelectedItems();
    let count = 0;
    let permissionCount = 0;

    this.initShowEvents.forEach(init => {
      if (init.isChecked === true) {
        count++;
      }
      if(init.permission === true) {
        permissionCount++;
      }
    });

    if (permissionCount === count) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  fetchSelectedItems() {
    this.unSelectedItemsList = this.events.filter((value, index) => {
      return value.isChecked;
    });
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
      // tslint:disable-next-line: no-shadowed-variable
    }).then((result) => {
      if (result.value) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.deleteData.length; i++) {
          this.eventService.deleteEvent(this.deleteData[i]).subscribe(
            data => {
              const index = this.calendarEvents.indexOf(this.deleteData[i]);
              this.calendarEvents.splice(index, 1);
              this.calendarComponent
                .getApi()
                .getEventById(String(this.deleteData[i]))
                .remove();
              Swal.fire({
                text: '刪除成功',
                icon: 'success',
              }).then((res) => {
                window.location.reload();
              });
            }, error => {
              console.log(error);
            }
          );
        }
      }
    });

  }

  onChange() {
    this.showEvents = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].startDate.substr(0, 4) === this.selectYear && this.events[i].startDate.substr(5, 2) === this.selectMonth) {
        this.showEvents.push(this.events[i]);
      }
    }

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



}
