import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-add-subscribe',
  templateUrl: './add-subscribe.component.html',
  styleUrls: ['./add-subscribe.component.scss']
})
export class AddSubscribeComponent implements OnInit {
  isOpen = true;
  calendars = [];
  selectedItemsList = [];
  formData = new FormData();
  userURL = '';
  isCheckedId = [];
  dataCalendar = [];

  constructor(
    private router: Router,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.subscriptionService.getSubscription().subscribe(
      data => {
        console.log(data);
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.dataCalendar.push(data[i].calendar);
          this.isCheckedId.push(data[i].id);
        }
        this.calendarService.getCalendar().subscribe(
          result => {
            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < result.length; j++) {
              if (this.dataCalendar.includes(result[j].id)) {
                this.calendars.push({ id: result[j].id, name: result[j].name, isChecked: true });
              } else {
                this.calendars.push({ id: result[j].id, name: result[j].name, isChecked: false });
              }
            }
          }
        );
      },
      error => {
        console.log(error);
      }
    );

    this.subscriptionService.getURL().subscribe(
      data => {
        this.userURL = data.url;
        console.log(this.userURL);
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

  changeSelection() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.isCheckedId.length; i++) {
      this.subscriptionService.deleteEvent(this.isCheckedId[i]).subscribe(
        data => {
          this.isCheckedId = [];
        }
      );
    }
    this.fetchSelectedItems();
    this.fetchCheckedIDs();
  }

  fetchSelectedItems() {
    this.selectedItemsList = this.calendars.filter((value, index) => {
      return value.isChecked;
    });
  }

  fetchCheckedIDs() {
    this.calendars.forEach((value, index) => {
      if (value.isChecked === true) {
        this.formData.append('calendar', value.id);
      }
    });

  }

  add() {
    this.subscriptionService.postSubscription(this.formData).subscribe(
      data => {
        console.log(data);
        this.subscriptionService.getSubscription().subscribe(
          result => {
            console.log(result);
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < result.length; i++) {
              this.isCheckedId.push(result[i].id);
            }
          });
      },
      error => {
        console.log(error);
      }
    );
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
