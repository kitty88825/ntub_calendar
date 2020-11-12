import { Router } from '@angular/router';
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
  unSubEvent = new FormData();
  subEvent = new FormData();
  subCalendar = new FormData();
  unSubCalendar = new FormData();
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  searchText = '';
  hasSubEvent = [];
  hasSubEventId = [];
  hasSubCalendar = [];
  hasSubCalendarId = [];
  allEvents = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  year = [];
  setYear = Number(this.todayDate.substr(0, 4)) - 1911;
  term = [1, 2];
  setTerm = 0;
  showEvent = [];
  calendarSmall = '';
  staff = localStorage.getItem('staff');

  constructor(
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
    private eventService: EventService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => this.calendars.push({ id: calendar.id, name: calendar.name, isChecked: false }));
        this.eventService.getEvents().subscribe(
          res => {
            res.forEach(event => {
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

            this.subscriptionService.getCalendarSubscription().subscribe(
              re => {
                re.forEach(calendar => {
                  this.hasSubCalendar.push(calendar);
                  this.hasSubCalendarId.push(calendar.id);
                });

                this.calendars.forEach(calendar => {
                  this.hasSubCalendar.forEach(hasSub => {
                    if (calendar.id === hasSub.id) {
                      calendar.isChecked = true;
                    }
                  });
                  if (calendar.isChecked === true) {
                    const calendarEvents = [];
                    let calendarsName = '';
                    let calendarId = 0;
                    this.allEvents.forEach(event => {
                      if (Number(this.setTerm) === 1) {
                        if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
                          Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                          Number(event.startAt.substr(5, 2)) < 7) {
                          calendarsName = calendar.name;
                          calendarId = calendar.id;
                          calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                        }
                      } else if (Number(this.setTerm) === 2) {
                        if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
                          Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                          Number(event.startAt.substr(5, 2)) >= 7) {
                          calendarsName = calendar.name;
                          calendarId = calendar.id;
                          calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                        }
                      }
                    });
                    if (calendarsName !== '') {
                      this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
                    } else if (calendarsName === '') {
                      this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: calendarEvents, isChecked: false });
                    }
                  } else if (calendar.isChecked === false) {
                    const index = this.showEvent.findIndex(calendarEvent => calendarEvent.calendarName === calendar.name);
                    if (index >= 0) {
                      this.showEvent.splice(index, 1);
                    }
                  }
                });
              }
            );

            this.subscriptionService.getEventSubscription().subscribe(
              re => {
                re.forEach(events => {
                  this.hasSubEvent.push(events);
                  this.hasSubEventId.push(events.id);
                });

                this.calendars.forEach(calendar => {
                  let unAllCalendarId = [];
                  this.hasSubEvent.forEach(hasSub => {
                    if (calendar.id === hasSub.eventinvitecalendarSet[0].mainCalendar.id) {
                      calendar.isChecked = true;
                      unAllCalendarId.push(calendar.id);
                    }
                  });
                  // tslint:disable-next-line: only-arrow-functions
                  unAllCalendarId = unAllCalendarId.filter(function (el, i, arr) {
                    return arr.indexOf(el) === i;
                  });

                  if (calendar.isChecked === true && unAllCalendarId.includes(calendar.id)) {
                    const calendarEvents = [];
                    let calendarsName = '';
                    let calendarId = 0;
                    this.allEvents.forEach(event => {
                      if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
                        calendarsName = calendar.name;
                        calendarId = calendar.id;
                        calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                      }
                    });
                    this.hasSubEvent.forEach(hasSub => {
                      calendarEvents.forEach(calendarEvent => {
                        if (hasSub.id === calendarEvent.id) {
                          calendarEvent.isChecked = true;
                        }
                      });
                    });
                    this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });
                  }
                });
              }
            );
          }
        );
      }
    );
  }

  selectCalendar(id) {
    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true && calendar.id === id) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else if (this.hasSubCalendarId.includes(calendar.id) === false && this.hasSubEventId.includes(event.id) === false) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else if (this.hasSubCalendarId.includes(calendar.id) === false && this.hasSubEventId.includes(event.id) === false) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          }
        });
        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }
      } else if (calendar.isChecked === false && calendar.id === id) {
        const index = this.showEvent.findIndex(calendarEvent => calendarEvent.calendarName === calendar.name);
        if (index >= 0) {
          this.showEvent.splice(index, 1);
        }
      }
    });
  }

  selectCalendarSmall(name) {
    this.calendars.forEach(calendar => {
      if (calendar.name === name) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else if (this.hasSubCalendarId.includes(calendar.id) === false && this.hasSubEventId.includes(event.id) === false) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else if (this.hasSubCalendarId.includes(calendar.id) === false && this.hasSubEventId.includes(event.id) === false) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          }
        });
        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }
      }
    });

  }

  changeTerm() {
    this.resetData();
  }

  changeYear() {
    this.resetData();
  }

  resetData() {
    this.showEvent = [];

    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) < 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id &&
              Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
              Number(event.startAt.substr(5, 2)) >= 7) {
              calendarsName = calendar.name;
              calendarId = calendar.id;
              if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
              } else {
                calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
              }
            }
          }
        });

        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }
      }
    });
  }

  reset() {
    this.showEvent.forEach(calendarEvents => {
      if (calendarEvents.events.length !== 0) {
        calendarEvents.isChecked = true;
        calendarEvents.events.forEach(event => {
          event.isChecked = true;
        });
      } else if (calendarEvents.events.length === 0) {
        calendarEvents.isChecked = false;
      }
    });
  }

  submit() {
    this.showEvent.forEach(calendarEvents => {
      if (calendarEvents.isChecked === true) {
        this.subCalendar.append('calendars', calendarEvents.id);
        this.allEvents.forEach(event => {
          if (calendarEvents.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
            this.unSubEvent.append('events', event.id);
          }
        });
        this.subscriptionService.postEventUnSub(this.unSubEvent).subscribe(
          data => {
            this.subscriptionService.postCalendarSubscribe(this.subCalendar).subscribe(
              res => {
              }
            );
          }
        );
      } else if (calendarEvents.isChecked === false) {
        this.unSubCalendar.append('calendars', calendarEvents.id);
        this.subscriptionService.postCalendarUnSub(this.unSubCalendar).subscribe(
          data => {
            calendarEvents.events.forEach(event => {
              if (event.isChecked === true) {
                this.subEvent.append('events', event.id);
                this.subscriptionService.postEventSubscribe(this.subEvent).subscribe(
                  res => {
                  }
                );
              } else if (event.isChecked === false) {
                this.unSubEvent.append('events', event.id);
                this.subscriptionService.postEventUnSub(this.unSubEvent).subscribe(
                  res => {
                  }
                );
              }
            });
          }
        );
      }
    });
    Swal.fire({
      text: '成功！',
      icon: 'success'
    }).then((result) => {
      this.router.navigate(['/my-url']);
    });
  }

  changeEvent(calendar) {
    const calendarEventsCount = calendar.events.length;
    let trueCount = 0;
    calendar.events.forEach(event => {
      if (event.isChecked === false) {
        calendar.isChecked = false;
      } else {
        trueCount++;
      }
    });
    if (trueCount === calendarEventsCount) {
      calendar.isChecked = true;
    }
  }

  changeAll(calendar) {
    calendar.events.forEach(event => {
      event.isChecked = calendar.isChecked;
    });
  }

}
