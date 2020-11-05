import { EventService } from './../services/event.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-add-subscribe',
  templateUrl: './add-subscribe.component.html',
  styleUrls: ['./add-subscribe.component.scss']
})
export class AddSubscribeComponent implements OnInit {
  calendars = [];
  formData = new FormData();
  userURL = '';
  isCollapsed = false;
  searchText = '';
  allEvents = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  year = [];
  setYear = Number(this.todayDate.substr(0, 4)) - 1911;
  term = [1, 2];
  setTerm = 0;
  showEvent = [];

  constructor(
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => this.calendars.push({ id: calendar.id, name: calendar.name, isChecked: false }));
      }
    );

    this.eventService.getEvents().subscribe(
      data => {
        data.forEach(event => {
          this.allEvents.push(event);
          this.year.push(Number(event.startAt.substr(0, 4)) - 1911);
        });

        if (Number(this.todayDate.substr(6, 2)) >= 7) {
          this.setTerm = 1;
        } else {
          this.setTerm = 2;
        }

        // tslint:disable-next-line: only-arrow-functions
        this.year = this.year.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.year.sort(function (a, b) {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
          return 0;
        });

      }
    );
  }

  /* To copy Text from Textbox */
  copyInputMessage(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    Swal.fire({
      text: '已複製',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  }

  selectCalendar() {
    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        this.allEvents.forEach(event => {
        });
      }
    });
  }

}
