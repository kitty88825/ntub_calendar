import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-calendar',
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.scss']
})
export class UserCalendarComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    const calendarDiv: HTMLElement = document.getElementById('calendar');
    const calendar = new Calendar(calendarDiv, {
      plugins: [dayGridPlugin, bootstrapPlugin, listPlugin],
      defaultView: 'listYear',
      events: [
        {
          title: 'Meeting',
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
        left: 'prev',
        center: 'title',
        right: 'next'
      },

    });
    calendar.render();
  }


}
