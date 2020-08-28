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
  showModal: boolean;
  events = [];
  event; eventTitle; eventStart; eventEnd; eventDesc; eventOffice;
  calendarName = [];

  constructor(
    private router: Router,
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin, bootstrapPlugin, listPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes = [];

  hiddenCalendarEvents: Event[] = [];


  eventClick(info) {
    this.showModal = true; // Show-Hide Modal

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      if (String(this.events[i].id) === String(info.event.id)) {
        this.event = this.events[i];
        this.eventTitle = this.events[i].title;
        this.eventStart = this.events[i].startDate + ' ' + this.events[i].sTime;
        this.eventEnd = this.events[i].endDate + ' ' + this.events[i].eTime;
        this.eventDesc = this.events[i].description;
        this.eventOffice = this.events[i].calendars;
      }
    }

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
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {

          this.events.push({
            id: data[i].id, title: data[i].title, start: data[i].startAt, calendars: data[i].calendars,
            end: data[i].endAt, name: data[i].calendars, startDate: data[i].startAt.substr(0, 10),
            endDate: data[i].endAt.substr(0, 10), description: data[i].description,
            sTime: data[i].startAt.substring(11, 16), eTime: data[i].endAt.substring(11, 16)
          });

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

        console.log(this.events);

        this.calendarEvents = this.events;

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
    this.showModal = false;
  }

}
