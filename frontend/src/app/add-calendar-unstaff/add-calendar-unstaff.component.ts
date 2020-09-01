import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-calendar-unstaff',
  templateUrl: './add-calendar-unstaff.component.html',
  styleUrls: ['./add-calendar-unstaff.component.scss']
})
export class AddCalendarUnstaffComponent implements OnInit {
  isMeet = true;
  isSchedule = !this.isMeet;
  attribute = 'public';
  
  constructor() { }

  ngOnInit(): void {
  }

  meet(value) {

    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = 'private';
    }
  }

  schedule(value) {

    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = 'public';
    }
  }

}
