import { Component, ViewChild } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
// import { CalendarService } from '../services/calendar.service';


@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.scss']
})
export class MainCalendarComponent {
  user = false;
  official = !this.user;

  // const calendarDiv: HTMLElement = document.getElementById('calendar');

  // const calendar = new Calendar(calendarDiv, {

  //   plugins: [dayGridPlugin, bootstrapPlugin, listPlugin],
  //   defaultView: 'listYear',
  //   events: [
  //     {
  //       id: '1',
  //       title: 'Meeting',
  //       start: '2020-04-25',
  //       category: 'day'
  //     },
  //     {
  //       id: '2',
  //       title: 'Meeting',
  //       start: '2020-04-26',
  //       category: 'night'
  //     },
  //     {
  //       id: '3',
  //       title: 'Meeting',
  //       start: '2020-04-27',
  //       category: 'day'
  //     }
  //   ],
  //   themeSystem: 'bootstrap',
  //   header: {
  //     left: 'prev',
  //     center: 'title',
  //     right: 'next'
  //   },

  //   eventClick(info) {
  //     Swal.fire({
  //       text: '確定要刪除' + info.event.title + '?',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#aaa',
  //       confirmButtonText: '確定',
  //       cancelButtonText: '取消'
  //     }).then((result) => {
  //       if (result.value) {
  //         const event = calendar.getEventById(info.event.id);
  //         event.remove();
  //         Swal.fire({
  //           text: '已刪除',
  //           icon: 'success',
  //         });
  //       }
  //     });
  //   },

  //   eventRender(info) {
  //     if (info.event.extendedProps.category === 'day') {
  //       // Change color of dot marker
  //       const dotEl = info.el.getElementsByClassName('fc-event-dot')[0] as HTMLElement;
  //       if (dotEl) {
  //         dotEl.style.backgroundColor = 'orange';
  //       }
  //     } else if (info.event.extendedProps.category === 'night') {
  //       // Change color of dot marker
  //       const dotE2 = info.el.getElementsByClassName('fc-event-dot')[0] as HTMLElement;
  //       if (dotE2) {
  //         dotE2.style.backgroundColor = 'black';
  //       }
  //     }

  //   }


  // });


  // calendar.render();



  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template


  calendarPlugins = [dayGridPlugin, bootstrapPlugin, listPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[] = [
    { id: 1, title: 'Meeting', start: '2020-05-03T12:00', color: 'orange', category: 1 },
    { id: 2, title: '放假', start: '2020-05-02', color: 'black', category: 2 },
    { id: 3, title: '吃飯', start: '2020-05-01', color: 'orange', category: 1 }
  ];
  eventTypes: any[] = [
    { title: '日間部', id: 1, selected: true },
    { title: '進修部', id: 2, selected: true },
  ];
  hiddenCalendarEvents: EventInput[] = [];

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

    console.log(calendarEvents);

    this.calendarEvents = calendarEvents; // reassign the array
  }

}
