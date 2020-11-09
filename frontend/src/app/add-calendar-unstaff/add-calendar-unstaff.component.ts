import { CalendarService } from './../services/calendar.service';
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
  color = '#839B91';
  isTrue = false;
  isOpen = false;
  allCalendar = [];
  count = 1;
  items = [0, 1];
  setPermissions = [{ id: 0, groupName: '', role: 'student', authority: 'read', group: [] },
  { id: 0, groupName: '', role: 'student', authority: 'read', group: [] }];

  constructor(
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.allCalendar.push({ id: calendar.id, name: calendar.name });
        });
      }
    )
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

  addOffice() {
    this.count++;
    this.items.push(this.count);
    this.setPermissions.push({ groupName: '', role: 'student', authority: 'read', group: [], id: 0 });
  }

  changeOffice(item, info) {
    this.setPermissions[item].groupName = info.target.value;
    this.allCalendar.forEach(calendar => {
      if (calendar.name === info.target.value) {
        this.setPermissions[item].group = calendar.id;
      }
    });
  }

  changeRole(item, info) {
    this.setPermissions[item].role = info.target.value;
  }

  changeAuthority(item, info) {
    this.setPermissions[item].authority = info.target.value;
  }

  deleteOffice(index) {
    this.setPermissions.splice(index, 1);
    this.items.splice(index, 1);
  }

}
