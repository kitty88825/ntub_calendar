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
  attribute = '';

  constructor() { }

  ngOnInit(): void {
  }

  meet(value) {

    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = '不公開';
    }
    console.log(this.attribute);
  }

  schedule(value) {

    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = '公開';
    }
    console.log(this.attribute);
  }

  addCalendar() {

  }

}
