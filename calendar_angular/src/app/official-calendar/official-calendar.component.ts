import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';

@Component({
  selector: 'app-official-calendar',
  templateUrl: './official-calendar.component.html',
  styleUrls: ['./official-calendar.component.scss']
})
export class OfficialCalendarComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
    const calendarDiv: HTMLElement = document.getElementById('calendar');
    const calendar = new Calendar(calendarDiv, {
      plugins: [dayGridPlugin, bootstrapPlugin, listPlugin],
      defaultView: 'listYear',
      events: [
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: '專題會議',
          start: '2020-04-02T14:30:00',
          extendedProps: {
            status: 'done'
          }
        },
        {
          title: 'Birthday Party',
          start: '2020-04-03T07:00:00',
          backgroundColor: 'green',
          borderColor: 'green'
        }
      ],
      themeSystem: 'bootstrap',
      header: {
        left: '',
        center: '',
        right: ''
      },

    });
    calendar.render();
  }

}
