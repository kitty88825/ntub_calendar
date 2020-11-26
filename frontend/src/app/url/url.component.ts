import { EventService } from './../services/event.service';
import { CalendarService } from './../services/calendar.service';
import { SubscriptionService } from './../services/subscription.service';
import { Router } from '@angular/router';
import { URLService } from './../services/url.service';
import { TokenService } from './../services/token.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';
import { ViewChild } from '@angular/core';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss']
})
export class URLComponent implements OnInit {
  url = '';
  userEmail = '';
  formData = new FormData();
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  subCalendarId = [];
  subCalendar = [];
  searchText = '';
  showEvent = [];
  subEvents = [];
  allCalendar = [];

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
    private tokenService: TokenService,
    private urlService: URLService,
    private router: Router,
    private eventService: EventService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;
    this.tokenService.getUser().subscribe(
      data => {
        this.url = data.url;
        this.userEmail = data.email;
      }
    );

    this.subscriptionService.getEventSubscription().subscribe(
      data => {
        data.forEach(event => {
          this.subEvents.push({
            id: event.id, title: event.title, calendars: event.eventinvitecalendarSet,
            color: event.eventinvitecalendarSet[0].mainCalendar.color, startDate: event.startAt.substr(0, 10)
          });
          this.subCalendarId.push(event.eventinvitecalendarSet[0].mainCalendar.id);
        });

        this.showEvent = this.subEvents;

        this.subCalendarId = this.subCalendarId.filter((el, i, arr) => {
          return arr.indexOf(el) === i;
        });

        this.calendarService.getCalendar().subscribe(
          result => {
            result.forEach(calendar => {
              this.subCalendarId.forEach(subId => {
                if (calendar.id === subId) {
                  this.subCalendar.push({
                    id: calendar.id, name: calendar.name, color: calendar.color, display: calendar.display,
                    description: calendar.description, permissions: calendar.permissions, isChecked: true
                  });
                }
              });
            });
          }
        );
      }
    );

    this.subscriptionService.getCalendarSubscription().subscribe(
      data => {
        data.forEach(calendar => {
          this.subCalendar.push({
            id: calendar.id, name: calendar.name, color: calendar.color, display: calendar.display,
            description: calendar.description, permissions: calendar.permissions, isChecked: true
          });
          this.allCalendar.push(calendar.id);
        });
        this.eventService.getEvents().subscribe(
          res => {
            res.forEach(event => {
              this.allCalendar.forEach(all => {
                if (event.eventinvitecalendarSet[0].mainCalendar.id === all) {
                  this.showEvent.push({
                    id: event.id, title: event.title, calendars: event.eventinvitecalendarSet,
                    color: event.eventinvitecalendarSet[0].mainCalendar.color, startDate: event.startAt.substr(0, 10)
                  });
                }
              });
            });
            this.showEventSort();

            this.loading = !this.loading;
          }
        );

      }
    );

  }

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

  renewURL() {
    Swal.fire({
      text: '確定要註銷並獲取一個新的URL?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value === true) {
        this.formData.append('email', this.userEmail);
        this.urlService.postRenewURL(this.formData).subscribe(
          data => {
            this.url = data.url;
          }
        );
      }
    });
  }

  edit() {
    this.router.navigate(['/add-subscribe']);
  }

  changeSelect() {
    this.showEvent = [];
    this.subCalendar.forEach(calendar => {
      this.subEvents.forEach(event => {
        if (calendar.isChecked === true && event.calendars[0].mainCalendar.id === calendar.id) {
          this.showEvent.push(event);
        }
      });
    });
  }

  showEventSort() {
    this.showEvent.sort((a, b) => {
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
