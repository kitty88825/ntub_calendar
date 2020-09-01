import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CalendarService } from './../services/calendar.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-calendar',
  templateUrl: './add-calendar.component.html',
  styleUrls: ['./add-calendar.component.scss']
})
export class AddCalendarComponent implements OnInit {
  isCollapsed = false;
  isMeet = true;
  isSchedule = !this.isMeet;
  attribute = 'public';
  calendarName = '';
  formData = new FormData();
  description = '';

  constructor(
    private calendarService: CalendarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  meet(value) {

    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = 'private';
    }
  }

  schedule(value) {

    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = 'public';
    }
  }

  addCalendar() {
    this.formData.append('name', this.calendarName);
    this.formData.append('description', this.description);
    this.formData.append('display', this.attribute);
    this.calendarService.postCalendar(this.formData).subscribe(
      data => {
        Swal.fire({
          text: '新增成功',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '返回首頁',
        }).then((result) => {
          if (result.value) {
            this.router.navigate(['/calendar']);
          }
        });
      },
      error => {
        console.log(error);
      }
    );
  }

}
