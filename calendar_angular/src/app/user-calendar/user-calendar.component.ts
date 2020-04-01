import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listWeekPlugin from '@fullcalendar/list';
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
      plugins: [dayGridPlugin, bootstrapPlugin, listWeekPlugin],
      themeSystem: 'bootstrap',
      header: {
        left: 'prevYear,prev,next,nextYear,today',
        center: 'title',
        right: 'listYear,dayGridMonth,dayGridWeek,dayGridDay'
      },

    });
    calendar.render();
  }

  logout() {
    Swal.fire({
      text: '是否確定要登出？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/login']);
      }
    });
  }

}
