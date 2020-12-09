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
  privateCalendars = [];
  publicCalendars = [];
  unSubEvent = new FormData();
  subEvent = new FormData();
  subCalendar = new FormData();
  unSubCalendar = new FormData();
  isCollapsed = false;
  isClose = false;
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
  setYear;
  term = [1, 2];
  setTerm;
  showEvent = [];
  permission = localStorage.getItem('permission');

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
    let year = Number(this.todayDate.substr(0, 4)) - 1911;
    this.loading = !this.loading;
    this.setYear = year;

    for (let i = 0; i < 5; i++) {
      this.year.push(year);
      year++;
    }

    this.yearSort();

    if (Number(this.todayDate.substr(5, 2)) >= 7 || Number(this.todayDate.substr(5, 2)) === 1) {
      this.setTerm = 1;
    } else {
      this.setTerm = 2;
    }

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.calendars.push({
            id: calendar.id, name: calendar.name, isChecked: false,
            display: calendar.display
          });
        }
        );

        if (Number(this.setTerm) === 1) {
          this.eventService.getEventsYear(String(Number(this.setYear) + 1911) + '-08', String(Number(this.setYear) + 1912) + '-01')
            .subscribe(
              result => {
                result.forEach(event => {
                  this.allEvents.push(event);
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
                        let count = 0;
                        this.allEvents.forEach(event => {
                          if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
                            calendarsName = calendar.name;
                            calendarId = calendar.id;
                            calendarEvents.push({
                              id: event.id, title: event.title,
                              startDate: event.startAt.substr(0, 10), isChecked: true
                            });
                          } else {
                            count++;
                          }
                        });
                        this.calendarEventSort(calendarEvents);

                        if (count === this.allEvents.length) {
                          calendarId = calendar.id;
                          calendarsName = calendar.name;
                          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: [], isChecked: true });
                        } else {
                          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
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
                      let count = 0;
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
                            calendarEvents.push({
                              id: event.id, title: event.title,
                              startDate: event.startAt.substr(0, 10), isChecked: false
                            });
                          }
                        });
                        this.hasSubEvent.forEach(hasSub => {
                          calendarEvents.forEach(calendarEvent => {
                            if (hasSub.id === calendarEvent.id) {
                              calendarEvent.isChecked = true;
                              count++;
                            }
                          });
                        });
                        this.calendarEventSort(calendarEvents);
                        this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });

                        this.showEvent.forEach(event => {
                          if (count === event.events.length && event.events.length !== 0) {
                            event.isChecked = true;
                          }
                        });
                      }
                    });

                    this.loading = !this.loading;
                  }
                );

              }
            );
          this.calendars.forEach(calendar => {
            if (calendar.display === 'private') {
              this.privateCalendars.push(calendar);
            } else if (calendar.display === 'public') {
              this.publicCalendars.push(calendar);
            }
          });
        } else if (Number(this.setTerm) === 2) {
          this.eventService.getEventsYear(String(Number(this.setYear) + 1912) + '-02', String(Number(this.setYear) + 1912) + '-07')
            .subscribe(
              result => {
                result.forEach(event => {
                  this.allEvents.push(event);
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
                        let count = 0;
                        this.allEvents.forEach(event => {
                          if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
                            calendarsName = calendar.name;
                            calendarId = calendar.id;
                            calendarEvents.push({
                              id: event.id, title: event.title,
                              startDate: event.startAt.substr(0, 10), isChecked: true
                            });
                          } else {
                            count++;
                          }
                        });
                        this.calendarEventSort(calendarEvents);

                        if (count === this.allEvents.length) {
                          calendarId = calendar.id;
                          calendarsName = calendar.name;
                          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: [], isChecked: true });
                        } else {
                          this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: true });
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
                      let count = 0;
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
                            calendarEvents.push({
                              id: event.id, title: event.title,
                              startDate: event.startAt.substr(0, 10), isChecked: false
                            });
                          }
                        });
                        this.hasSubEvent.forEach(hasSub => {
                          calendarEvents.forEach(calendarEvent => {
                            if (hasSub.id === calendarEvent.id) {
                              calendarEvent.isChecked = true;
                              count++;
                            }
                          });
                        });
                        this.calendarEventSort(calendarEvents);
                        this.showEvent.push({ id: calendarId, calendarName: calendarsName, events: calendarEvents, isChecked: false });

                        this.showEvent.forEach(event => {
                          if (count === event.events.length && event.events.length !== 0) {
                            event.isChecked = true;
                          }
                        });
                      }
                    });

                    this.loading = !this.loading;
                  }
                );

              }
            );
          this.calendars.forEach(calendar => {
            if (calendar.display === 'private') {
              this.privateCalendars.push(calendar);
            } else if (calendar.display === 'public') {
              this.publicCalendars.push(calendar);
            }
          });
        }
      }
    );
  }

  selectCalendar(id) {
    this.loading = !this.loading;
    this.allEvents.length = 0;

    if (this.setYear === '所有學年度') {
      this.setTerm = '整個學期';
    }

    if (Number(this.setTerm) === 1) {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1911) + '-08', String(Number(this.setYear) + 1912) + '-01')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.changeCalendarGetDate(id);
          }
        );
    } else if (Number(this.setTerm) === 2) {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1912) + '-02', String(Number(this.setYear) + 1912) + '-07')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.changeCalendarGetDate(id);
          }
        );
    } else if (this.setTerm === '整個學期' && this.setYear !== '所有學年度') {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1911) + '-08', String(Number(this.setYear) + 1912) + '-07')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.changeCalendarGetDate(id);
          }
        );
    } else if (this.setYear === '所有學年度') {
      this.eventService.getEvents().subscribe(
        data => {
          data.forEach(event => {
            this.allEvents.push(event);
          });

          this.changeCalendarGetDate(id);
        }
      );
    }
  }

  calendarEventSort(calendarEvent) {
    calendarEvent.sort((a, b) => {
      const startA = a.startDate.toUpperCase();
      const startB = b.startDate.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
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
    this.allEvents.length = 0;
    this.loading = !this.loading;

    if (this.setYear === '所有學年度') {
      this.setTerm = '整個學期';
    }

    if (Number(this.setTerm) === 1) {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1911) + '-08', String(Number(this.setYear) + 1912) + '-01')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.getData();
          }
        );
    } else if (Number(this.setTerm) === 2) {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1912) + '-02', String(Number(this.setYear) + 1912) + '-07')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.getData();
          }
        );
    } else if (this.setTerm === '整個學期' && this.setYear !== '所有學年度') {
      this.eventService.getEventsYear(String(Number(this.setYear) + 1911) + '-08', String(Number(this.setYear) + 1912) + '-07')
        .subscribe(
          data => {
            data.forEach(event => {
              this.allEvents.push(event);
            });

            this.getData();
          }
        );
    } else if (this.setYear === '所有學年度') {
      this.eventService.getEvents().subscribe(
        data => {
          data.forEach(event => {
            this.allEvents.push(event);
          });

          this.getData();
        }
      );
    }
  }

  getData() {
    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        let count = 0;
        this.allEvents.forEach(event => {
          calendarsName = calendar.name;
          calendarId = calendar.id;
          if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
            if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
              count++;
              calendarEvents.push({ id: event.id, title: event.title, startDate: event.startAt.substr(0, 10), isChecked: true });
            } else {
              calendarEvents.push({ id: event.id, title: event.title, startDate: event.startAt.substr(0, 10), isChecked: false });
            }
          }
        });
        this.calendarEventSort(calendarEvents);
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
    this.loading = !this.loading;
  }

  changeCalendarGetDate(id) {
    this.calendars.forEach(calendar => {
      if (calendar.isChecked === true && calendar.id === id) {
        const calendarEvents = [];
        let calendarsName = '';
        let calendarId = 0;
        let count = 0;
        this.allEvents.forEach(event => {
          calendarsName = calendar.name;
          calendarId = calendar.id;
          if (calendar.id === event.eventinvitecalendarSet[0].mainCalendar.id) {
            if (this.hasSubCalendarId.includes(calendar.id) || this.hasSubEventId.includes(event.id)) {
              count++;
              calendarEvents.push({ id: event.id, title: event.title, startDate: event.startAt.substr(0, 10), isChecked: true });
            } else {
              calendarEvents.push({ id: event.id, title: event.title, startDate: event.startAt.substr(0, 10), isChecked: false });
            }
          }
        });
        this.calendarEventSort(calendarEvents);

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
        this.loading = !this.loading;

      } else if (calendar.isChecked === false && calendar.id === id) {
        const index = this.showEvent.findIndex(calendarEvent => calendarEvent.calendarName === calendar.name);

        if (index >= 0) {
          this.showEvent.splice(index, 1);
        }
        this.loading = !this.loading;
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

  submit(main: HTMLElement) {
    setTimeout(() => {
      main.scrollIntoView();
    }, 500);
    this.loading = !this.loading;

    this.showEvent.forEach(calendarEvents => {
      if (calendarEvents.isChecked === true && this.setYear === '所有學年度' && this.setTerm === '整個學期') {
        this.subCalendar.append('calendars', calendarEvents.id);
      } else if (calendarEvents.isChecked === false) {
        this.unSubCalendar.append('calendars', calendarEvents.id);
        calendarEvents.events.forEach(event => {
          if (event.isChecked === true) {
            this.subEvent.append('events', event.id);
          } else if (event.isChecked === false) {
            this.unSubEvent.append('events', event.id);
          }
        });
      } else if (calendarEvents.isChecked === true) {
        this.unSubCalendar.append('calendars', calendarEvents.id);
        calendarEvents.events.forEach(event => {
          if (event.isChecked === true) {
            this.subEvent.append('events', event.id);
          } else if (event.isChecked === false) {
            this.unSubEvent.append('events', event.id);
          }
        });
      }
    });

    if (this.subCalendar.get('calendars') !== null) {
      this.subscriptionService.postCalendarSubscribe(this.subCalendar).subscribe(
        data => {
        }
      );
    }
    if (this.unSubCalendar.get('calendars') !== null) {
      this.subscriptionService.postCalendarUnSub(this.unSubCalendar).subscribe(
        data => {
        }
      );
    }
    if (this.subEvent.get('events') !== null) {
      this.subscriptionService.postEventSubscribe(this.subEvent).subscribe(
        data => {
        }
      );
    }
    if (this.unSubEvent.get('events') !== null) {
      this.subscriptionService.postEventUnSub(this.unSubEvent).subscribe(
        data => {
        }
      );
    }

    setTimeout(() => {
      this.loading = !this.loading;
      Swal.fire({
        text: '成功！',
        icon: 'success'
      }).then((re) => {
        this.router.navigate(['/my-url']);
      });
    }, 2000);

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
