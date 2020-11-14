import { Router } from '@angular/router';
import { EventService } from './../services/event.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';
import { formatDate } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

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
  setYear = '所有學年度';
  term = [1, 2];
  setTerm = '整個學期';
  showEvent = [];
  calendarSmall = '';
  staff = localStorage.getItem('staff');

  @ViewChild('ngxLoading', { static: false }) ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public coloursEnabled = false;
  public loadingTemplate: TemplateRef<any>;
  public config = {
    animationType: ngxLoadingAnimationTypes.none, primaryColour: this.primaryColour,
    secondaryColour: this.secondaryColour, tertiaryColour: this.primaryColour, backdropBorderRadius: '3px'
  };

  constructor(
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
    private eventService: EventService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => this.calendars.push({ id: calendar.id, name: calendar.name, isChecked: false }));
        this.eventService.getEvents().subscribe(
          res => {
            res.forEach(event => {
              this.allEvents.push(event);
              this.year.push(Number(event.startAt.substr(0, 4)) - 1911);
            });

            this.yearSort();

            this.subscriptionService.getCalendarSubscription().subscribe(
              re => {
                console.log(re);

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
                      if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
                        calendarsName = calendar.name;
                        calendarId = calendar.id;
                        calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                      }
                    });
                    if (calendarsName !== '') {
                      this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
                    } else if (calendarsName === '') {
                      this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: calendarEvents, isChecked: false });
                    }
                  }
                });
              }
            );

            this.subscriptionService.getEventSubscription().subscribe(
              re => {
                console.log(re);

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

                  unAllCalendarId = unAllCalendarId.filter((el, i, arr) => {
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

                this.loading = !this.loading;
              }
            );
          }
        );
      }
    );
  }

  selectCalendar(id) {
    let count = 0;
    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true && calendar.id === id) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (this.setTerm === '整個學期') {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度') {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          }
        });
        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }

        this.showEvent.forEach(event => {
          if (count === event.events.length && event.events.length !== 0) {
            event.isChecked = true;
          }
        });

      } else if (calendar.isChecked === false && calendar.id === id) {
        const index = this.showEvent.findIndex(calendarEvent => calendarEvent.calendarName === calendar.name);
        if (index >= 0) {
          this.showEvent.splice(index, 1);
        }
      }
    });
  }

  selectCalendarSmall(name) {
    let count = 0;
    this.calendars.forEach(calendar => {
      if (calendar.name === name) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (this.setTerm === '整個學期') {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度') {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          }
        });

        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }

        this.showEvent.forEach(event => {
          if (count === event.events.length && event.events.length !== 0) {
            event.isChecked = true;
          }
        });
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
    let count = 0;

    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        this.allEvents.forEach(event => {
          if (Number(this.setTerm) === 1) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) < 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (Number(this.setTerm) === 2) {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911 &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度' &&
                Number(event.startAt.substr(5, 2)) >= 7) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          } else if (this.setTerm === '整個學期') {
            if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
              if (Number(this.setYear) === Number(event.startAt.substr(0, 4)) - 1911) {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              } else if (this.setYear === '所有學年度') {
                calendarsName = calendar.name;
                calendarId = calendar.id;
                if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
                  count++;
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: true });
                } else {
                  calendarEvents.push({ id: event.id, title: event.title, isChecked: false });
                }
              }
            }
          }
        });
        if (calendarsName !== '') {
          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });
        } else if (calendarsName === '') {
          this.showEvent.push({ id: calendarId, calendarName: calendar.name, events: [], isChecked: false });
        }

        this.showEvent.forEach(event => {
          if (count === event.events.length && event.events.length !== 0) {
            event.isChecked = true;
          }
        });
      }
    });
  }

  reset() {
    this.showEvent.forEach(calendarEvents => {
      if (calendarEvents.events.length !== 0) {
        calendarEvents.isChecked = false;
        calendarEvents.events.forEach(event => {
          event.isChecked = false;
        });
      } else if (calendarEvents.events.length === 0) {
        calendarEvents.isChecked = false;
      }
    });
  }

  submit() {
    this.loading = !this.loading;
    this.showEvent.forEach(calendarEvents => {
      if (calendarEvents.isChecked === true && this.setYear === '所有學年度' && this.setTerm === '整個學期') {
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
      } else {
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
    this.loading = !this.loading;

    setTimeout(() => {
      Swal.fire({
        text: '成功！',
        icon: 'success'
      }).then((result) => {
        this.router.navigate(['/my-url']);
      });
    }, 1000);
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

  yearSort() {
    this.year = this.year.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    this.year.sort((a, b) => {
      if (a < b) {
        return 1;
      }
      if (a > b) {
        return -1;
      }
      return 0;
    });
  }

  dataReset() {

  }

  toggleColours(): void {
    this.coloursEnabled = !this.coloursEnabled;

    if (this.coloursEnabled) {
      this.primaryColour = PrimaryRed;
      this.secondaryColour = SecondaryBlue;
    } else {
      this.primaryColour = PrimaryWhite;
      this.secondaryColour = SecondaryGrey;
    }
  }
}
