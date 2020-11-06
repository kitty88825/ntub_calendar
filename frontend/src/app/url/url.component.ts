import { CalendarService } from './../services/calendar.service';
import { SubscriptionService } from './../services/subscription.service';
import { Router } from '@angular/router';
import { URLService } from './../services/url.service';
import { TokenService } from './../services/token.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';

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
  subCalendarId = [];
  subCalendar = [];
  searchText = '';
  showEvent = [];
  subEvents = [];

  constructor(
    private tokenService: TokenService,
    private urlService: URLService,
    private router: Router,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.tokenService.getUser().subscribe(
      data => {
        this.url = data.url;
        this.userEmail = data.email;
      }
    );

    this.subscriptionService.getSubscription().subscribe(
      data => {
        data.forEach(event => {
          this.subEvents.push({
            id: event.id, title: event.title, calendars: event.eventinvitecalendarSet,
            color: event.eventinvitecalendarSet[0].mainCalendar.color
          });
          this.subCalendarId.push(event.eventinvitecalendarSet[0].mainCalendar.id);
        });

        this.showEvent = this.subEvents;
        // tslint:disable-next-line: only-arrow-functions
        this.subCalendarId = this.subCalendarId.filter(function (el, i, arr) {
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

  renewURL() {
    this.formData.append('email', this.userEmail);
    this.urlService.postRenewURL(this.formData).subscribe(
      data => {
        this.url = data.url;
      }
    );
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

}
