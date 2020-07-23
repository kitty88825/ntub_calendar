import { Component, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { ShareDataService } from '../services/share-data.service';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.scss']
})
export class MainCalendarComponent implements OnInit {
  user = true;
  official = !this.user;
  searchText = '';
  put;
  title;
  calendars = [];
  myCalendars = [];
  mySub = [];
  data = {
    current: '1'
  };
  isCollapsed = false;

  constructor(
    private router: Router,
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin, bootstrapPlugin, listPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes = [];

  hiddenCalendarEvents: Event[] = [];


  eventClick(info) {
    Swal.fire({
      text: '請選擇要執行的動作',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '編輯',
      cancelButtonText: '刪除',
      allowOutsideClick: false
    }).then((result) => {
      if (!result.value) {
        Swal.fire({
          text: '確定要刪除「' + info.event.title + '」?',
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
            this.eventService.deleteEvent(info.event.id).subscribe(
              data => {
                console.log(data);
                const index = this.calendarEvents.indexOf(info.id);
                this.calendarEvents.splice(index, 1);
                this.calendarComponent
                  .getApi()
                  .getEventById(String(info.event.id))
                  .remove();
                Swal.fire({
                  text: '已刪除',
                  icon: 'success',
                });
              },
              error => {
                Swal.fire({
                  text: '你沒有刪除權限唷！',
                  icon: 'error',
                });
              }
            );
          }
        });
      } else if (result.value) {
        this.eventService.getEvent(info.event.id).subscribe(
          data => {
            console.log(data);
            this.put = data;
            this.title = data.title;
            this.shareDataService.sendMessage(this.put);
          }
        );
        this.router.navigate(['/edit-schedule']);
      }
    });
  }

  displayType(eventType: any): void {

    eventType.selected = !eventType.selected;
    const calendarEvents = this.calendarEvents.slice(); // a clone

    if (eventType.selected === true) {
      const calendarEventsToShow: any[] = [];

      // Show
      this.hiddenCalendarEvents
        .filter(calendarEvent => calendarEvent.calendars.includes(eventType.id))
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
          if (calendarEvent.calendars.length === 1) {
            return calendarEvent.calendars.includes(eventType.id);
          } else if (calendarEvent.calendars.length > 1) {
            let count = 0;
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < calendarEvent.calendars.length; i++) {
              // tslint:disable-next-line: prefer-for-of
              for (let j = 0; j < this.eventTypes.length; j++) {
                if (calendarEvent.calendars[i] === this.eventTypes[j].id && this.eventTypes[j].selected === false) {
                  count++;
                  if (count === calendarEvent.calendars.length) {
                    return true;
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
          calendarEventsToHide.push(calendarEvent.id);
        });

      calendarEventsToHide.forEach(calendarEventToHide => {
        const index = calendarEvents.findIndex(calendarEvent => calendarEvent.id === calendarEventToHide);
        calendarEvents.splice(index, 1);
      });
    }
    this.calendarEvents = calendarEvents; // reassign the array
  }

  ngOnInit() {
    this.calendarService.getCalendar().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          this.myCalendars.push({ id: result[j].id, name: result[j].name });
        }
      }
    );

    this.subscriptionService.getSubscription().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.mySub.push({ id: data[i].id, name: data[i].name, calendar: data[i].calendar });
          this.eventTypes.push({ title: 'type' + data[i].calendar, id: data[i].calendar, selected: true });
        }
      }
    );

    this.eventService.getEvents().subscribe(
      data => {
        const events = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {

          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < this.mySub.length; j++) {
            // tslint:disable-next-line: prefer-for-of
            for (let k = 0; k < data[i].calendars.length; k++) {
              if (this.mySub[j].calendar === data[i].calendars[k]) {
                events.push({
                  id: data[i].id, title: data[i].title, start: data[i].startAt, name: this.mySub[j].name,
                  end: data[i].endAt, calendars: data[i].calendars, startDate: data[i].startAt.substr(0, 10)
                });
              }
            }
          }
        }
        events.sort(function (a, b) {
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

        this.calendarEvents = events;

      }
    );

  }

  setCurrent(param) {
    this.data.current = param;
    console.log(param);
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

  edit() {

  }


}
