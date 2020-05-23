import { Component, ViewChild, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { CalendarService } from '../services/calendar.service';

declare var $: any;


@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.scss']
})
export class MainCalendarComponent implements OnInit {
  user = true;
  official = !this.user;
  searchText = '';

  constructor(
    private router: Router,
    private calendarService: CalendarService
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template


  calendarPlugins = [dayGridPlugin, bootstrapPlugin, listPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes: any[] = [
    { title: 'type1', id: '1', selected: true },
    { title: 'type2', id: '2', selected: true },
    { title: 'type3', id: '3', selected: true },
  ];

  hiddenCalendarEvents: EventInput[] = [];

  eventClick(info) {
    Swal.fire({
      text: '請選擇要執行的動作',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '編輯',
      cancelButtonText: '刪除',
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
            this.calendarComponent
              .getApi()
              .getEventById(String(info.event.id))
              .remove();
            Swal.fire({
              text: '已刪除',
              icon: 'success',
            });
          }
        });
      } else if (result.value) {
        this.router.navigate(['/add-schedule']);
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
        .filter(calendarEvent => calendarEvent.category === eventType.id)
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
        .filter(calendarEvent => calendarEvent.category === eventType.id)
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


  eventRender(info) {
    const e = info.el;
    e.setAttribute('title', `點選編輯或刪除`);
    $(e).tooltip();
  }

  ngOnInit() {
    this.calendarService.getEvents().subscribe(
      data => {
        const events = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          events.push({
            id: data[i].id, title: data[i].title, start: data[i].startAt,
            end: data[i].endAt, category: data[i].calendars.toString()
          });
          this.calendarEvents = events;
        }
        console.log(events);
      }
    );
  }


}
