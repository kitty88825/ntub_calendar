import { Router } from '@angular/router';
import { URLService } from './../services/url.service';
import { TokenService } from './../services/token.service';
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
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  searchText = '';
  allEvents = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  year = [];
  setYear = Number(this.todayDate.substr(0, 4)) - 1911;
  term = [1, 2];
  setTerm = 0;
  showEvent = [];
  checkedAll = false;
  selectEventId = [];
  url = '';
  userEmail = '';
  calendarSmall = '';
  staff = localStorage.getItem('staff');

  constructor(
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
    private eventService: EventService,
    private tokenService: TokenService,
    private urlService: URLService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => this.calendars.push({ id: calendar.id, name: calendar.name, isChecked: false }));
      }
    );

    this.tokenService.getUser().subscribe(
      data => {
        this.url = data.url;
        this.userEmail = data.email;
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

    this.subscriptionService.getSubscription().subscribe(
      data => {
        data.forEach(event => {
          this.selectEventId.push(event.id);
        });
      }
    );
  }

  selectCalendar(id) {
    this.checkedAll = false;
    this.showEvent = [];
    const showEventCount = this.showEvent.length;
    let count = 0;

    this.calendars.forEach(calendar => {
      calendar.isChecked = false;
      if (calendar.id === id) {
        calendar.isChecked = true;
      }
    });

    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          }
        });
      }
    });

    this.showEvent.forEach(event => {
      if (this.selectEventId.includes(event.id)) {
        event.isChecked = true;
      }

      if (event.isChecked === true) {
        count++;
        this.selectEventId.push(event.id);
      }
    });

    if (count === showEventCount) {
      this.checkedAll = true;
    } else {
      this.checkedAll = false;
    }

    this.selectEventId = this.selectEventId.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });
  }

  selectCalendarSmall(name) {
    this.checkedAll = false;
    this.showEvent = [];
    const showEventCount = this.showEvent.length;
    let count = 0;

    this.calendars.forEach(calendar => {
      if (calendar.name === name) {
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          }
        });
      }
    });

    this.showEvent.forEach(event => {
      if (this.selectEventId.includes(event.id)) {
        event.isChecked = true;
      }

      if (event.isChecked === true) {
        count++;
        this.selectEventId.push(event.id);
      }
    });

    if (count === showEventCount) {
      this.checkedAll = true;
    } else {
      this.checkedAll = false;
    }

    this.selectEventId = this.selectEventId.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });

  }

  changeTerm() {
    this.resetData();
  }

  changeYear() {
    this.resetData();
  }

  checkAll() {
    this.showEvent.forEach(event => {
      event.isChecked = this.checkedAll;
    });
    this.showEvent.forEach(event => {
      if (event.isChecked === true) {
        this.selectEventId.push(event.id);
      } else {
        const index = this.selectEventId.findIndex(select => {
          return select === event.id;
        });
        if (index >= 0) {
          this.selectEventId.splice(index, 1);
        }
      }
    });
    this.selectEventId = this.selectEventId.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });
  }

  resetData() {
    this.checkedAll = false;
    this.showEvent = [];

    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              this.showEvent.push({ id: event.id, title: event.title, isChecked: false });
            }
          }
        });
      }
    });

    this.showEvent.forEach(event => {
      if (this.selectEventId.includes(event.id)) {
        event.isChecked = true;
      }

      if (event.isChecked === true) {
        this.selectEventId.push(event.id);
      }
    });

    this.selectEventId = this.selectEventId.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });
  }

  reset() {
    this.checkedAll = false;
    this.showEvent.forEach(event => {
      if (this.selectEventId.includes(event.id)) {
        event.isChecked = false;
        const index = this.selectEventId.findIndex(select => {
          return select === event.id;
        });
        if (index >= 0) {
          this.selectEventId.splice(index, 1);
        }
      }
    });
  }

  submit() {
    this.selectEventId.forEach(eventId => {
      this.formData.append('events', eventId);
    });
    this.eventService.postEventSubscribe(this.formData).subscribe(
      data => {
        Swal.fire({
          text: '新增訂閱成功',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            this.router.navigate(['/my-url']);
          }
        });
      }, error => {
        Swal.fire({
          text: '新增訂閱失敗',
          icon: 'error'
        });
      }
    );
  }

  changeEvent() {
    const showEventCount = this.showEvent.length;
    let count = 0;
    this.showEvent.forEach(event => {
      if (event.isChecked === true) {
        count++;
        this.selectEventId.push(event.id);
      } else if (event.isChecked === false) {
        const index = this.selectEventId.findIndex(select => {
          return select === event.id;
        });
        if (index >= 0) {
          this.selectEventId.splice(index, 1);
        }
      }
    });

    this.selectEventId = this.selectEventId.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });

    if (count === showEventCount) {
      this.checkedAll = true;
    } else {
      this.checkedAll = false;
    }
  }

  renewURL() {
    this.urlService.postRenewURL(this.userEmail).subscribe(
      data => {
        this.url = data.url;
      }
    );
  }

}
