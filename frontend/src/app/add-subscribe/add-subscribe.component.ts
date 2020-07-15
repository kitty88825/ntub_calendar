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
  isCollapsed = false;
  mySub = [];

  constructor(
    private router: Router,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.subscriptionService.getSubscription().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.dataCalendar.push(data[i].calendar);
          this.isCheckedId.push(data[i].id);
          this.mySub.push({ id: data[i].id, name: data[i].name, calendar: data[i].calendar });
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
          console.log(data);
          this.isCheckedId = [];
        }
      );
    }

    this.fetchCheckedIDs();
  }

  fetchCheckedIDs() {
    this.formData.delete('calendar');
    this.calendars.forEach((value, index) => {
      console.log(value.isChecked);
      if (value.isChecked === true) {
        this.formData.append('calendar', value.id);
      }
    });

  }

  creat() {
    this.mySub = [];

    this.subscriptionService.postSubscription(this.formData).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );

    this.subscriptionService.getSubscription().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          this.isCheckedId.push(result[j].id);
          this.mySub.push({ id: result[j].id, name: result[j].name, calendar: result[j].calendar });
        }
      }
    );

    let timerInterval;
    Swal.fire({
      title: '正 在 產 生 URL',
      timer: 800,
      onBeforeOpen: () => {
        Swal.showLoading(),
          timerInterval = setInterval(() => {
            const content = Swal.getContent();
            if (content) {
              const b = content.querySelector('b');
              if (b) {
                b.textContent = Swal.getTimerLeft();
              }
            }
          }, 100);
      },
      onClose: () => {
        clearInterval(timerInterval);
      }
    });
  }

}
