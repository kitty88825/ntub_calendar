import { TokenService } from './../services/token.service';
import { Component, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
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
  public pageSize = 9;
  user = true;
  official = !this.user;
  searchText = '';
  searchTextSmall = '';
  searchTextGrid = '';
  put;
  page = 0;
  title;
  openCalendar = [];
  calendars = [];
  mySub = [];
  data = {
    current: '1'
  };
  allEvents = [];
  isCollapsed = false;
  showEvent: boolean;
  events = [];
  event; eventTitle; eventStart; eventEnd; eventOffice; eventLocation;
  eventDescription; eventParticipant; eventFile;
  calendarName = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  pastEvents = [];
  editPermission: boolean;
  deletePermission: boolean;
  group = [];
  Selected = false;
  unSelectedItemsList = [];
  formData = new FormData();
  deleteData = [];
  permissionCount = 0;
  pastBtn = false;
  nowBtn = true;
  futureEvents = [];
  future = [];
  past = [];
  deleteCount = 0;

  constructor(
    private router: Router,
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
    private tokenService: TokenService
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes = [];

  hiddenCalendarEvents = [];


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
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < this.events.length; j++) {
            if (this.events[j].calendars.length === 1) {
              if (this.events[j].calendars.id === eventType.id) {
                return calendarEvent.calendars.id === eventType.id;
              }
            } else if (this.events[j].calendars.length > 1) {
              let count = 0;
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < calendarEvent.calendars.length; i++) {
                // tslint:disable-next-line: prefer-for-of
                for (let k = 0; k < this.eventTypes.length; k++) {
                  if (calendarEvent.calendars[i].id === this.eventTypes[k].id && this.eventTypes[k].selected === true) {
                    count++;
                    if (count === calendarEvent.calendars.length) {
                      return true;
                    }
                  }
                }
              }
            }
          }
        }
        )
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
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < this.events.length; j++) {
            if (this.events[j].calendars.length === 1) {
              if (this.events[j].calendars.id === eventType.id) {
                return calendarEvent.calendars.id === eventType.id;
              }
            } else if (this.events[j].calendars.length > 1) {
              let count = 0;
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < calendarEvent.calendars.length; i++) {
                // tslint:disable-next-line: prefer-for-of
                for (let k = 0; k < this.eventTypes.length; k++) {
                  if (calendarEvent.calendars[i].id === this.eventTypes[k].id && this.eventTypes[k].selected === false) {
                    count++;
                    if (count === calendarEvent.calendars.length) {
                      return true;
                    }
                  }
                }
              }
            }
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
        const index = calendarEvents.findIndex(calendarEvent => calendarEvent.calendar.id === calendarEventToHide);
        calendarEvents.splice(index, 1);
      });
    }

    this.calendarEvents = calendarEvents;

    this.futureEvents = this.calendarEvents.filter(fu => this.future.includes(fu.id));

    this.pastEvents = this.calendarEvents.filter(pa => this.past.includes(pa.id));

    // tslint:disable-next-line: only-arrow-functions
    this.futureEvents.sort(function (a, b) {
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
    this.pastEvents.sort(function (a, b) {
      const startA = a.start.toUpperCase(); // ignore upper and lowercase
      const startB = b.start.toUpperCase(); // ignore upper and lowercase
      if (startA < startB) {
        return 1;
      }
      if (startA > startB) {
        return -1;
      }

      // names must be equal
      return 0;
    });
  }

  ngOnInit() {
    this.tokenService.getUser().subscribe(
      re => {
        console.log(re);
        this.group = re.groups;
      }
    );

    this.calendarService.getCalendar().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          this.openCalendar.push({
            id: result[j].id, name: result[j].name,
            description: result[j].description, display: result[j].display,
            color: result[j].color, permission: result[j].permission
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

        this.calendarEvents = this.events;

        // tslint:disable-next-line: prefer-for-of
        for (let k = 0; k < this.events.length; k++) {
          if (this.events[k].startDate < this.todayDate && this.events[k].endDate < this.todayDate) {
            this.pastEvents.push(this.events[k]);
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.pastEvents.length; i++) {
              this.past.push(this.pastEvents[i].id);
            }
          } else {
            this.futureEvents.push(this.events[k]);
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.futureEvents.length; i++) {
              this.future.push(this.futureEvents[i].id);
            }
          }
        }

        // tslint:disable-next-line: only-arrow-functions
        this.future = this.future.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });


        // tslint:disable-next-line: only-arrow-functions
        this.past = this.past.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.pastEvents.sort(function (a, b) {
          const startA = a.start.toUpperCase(); // ignore upper and lowercase
          const startB = b.start.toUpperCase(); // ignore upper and lowercase
          if (startA < startB) {
            return 1;
          }
          if (startA > startB) {
            return -1;
          }

          // names must be equal
          return 0;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.futureEvents.sort(function (a, b) {
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





        // tslint:disable-next-line: prefer-for-of
        for (let k = 0; k < this.group.length; k++) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.events.length; i++) {
            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < this.events[i].permissions.length; j++) {
              if (Number(this.group[k]) === this.events[i].permissions[j].group) {
                this.events[i].permission = true;
              }
            }
          }
        }
      }
    );

  }

  changeToPast() {
    this.pastBtn = true;
    this.nowBtn = false;
  }

  changeToNow() {
    this.pastBtn = false;
    this.nowBtn = true;
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
    this.permissionCount = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].permission === true) {
        this.events[i].isChecked = this.Selected;
        this.permissionCount = this.permissionCount + 1;
      }
    }

    this.changeSelection();
  }

  changeSelection() {
    this.fetchSelectedItems();
  }

  fetchSelectedItems() {
    this.unSelectedItemsList = this.events.filter((value, index) => {
      return value.isChecked;
    });
  }

  fetchCheckedIDs(info) {
    this.deleteData.length = 0;
    this.permissionCount = 0;


    if (info.target.checked === true) {
      this.events.forEach((value, index) => {
        if (value.calendars.length > 1) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].id === value.id && value.isChecked === true) {
              this.events[i].isChecked = true;
            }
          }
          if (value.isChecked === true) {
            this.deleteData.push(value.id);
          }
        } else if (value.calendars.length === 1) {
          if (value.isChecked === true) {
            this.deleteData.push(value.id);
          }
        }
      });
    } else if (info.target.checked === false) {
      this.events.forEach((value, index) => {
        if (value.calendars.length > 1) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].id === value.id && value.isChecked === false) {
              this.events[i].isChecked = false;
            }
          }
          if (value.isChecked === true) {
            this.deleteData.push(value.id);
          }
        } else if (value.calendars.length === 1) {
          if (value.isChecked === true) {
            this.deleteData.push(value.id);
          }
        }
      });
    }
    this.deleteCount = this.deleteData.length;

    // tslint:disable-next-line: only-arrow-functions
    this.deleteData = this.deleteData.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });

    console.log(this.deleteData);

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {

      if (this.events[i].permission === true) {
        this.permissionCount = this.permissionCount + 1;
      }

    }
    console.log(this.deleteCount);
    console.log(this.permissionCount);

    if (this.permissionCount === this.deleteCount) {
      this.Selected = true;
    } else {
      this.Selected = false;
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

}
