import { TokenService } from './../services/token.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CalendarService } from './../services/calendar.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-calendar',
  templateUrl: './add-calendar.component.html',
  styleUrls: ['./add-calendar.component.scss']
})
export class AddCalendarComponent implements OnInit {
  isCollapsed = false;
  isOpened = false;
  isMeet = true;
  isSchedule = !this.isMeet;
  attribute = 'public';
  calendarName = '';
  formData = new FormData();
  description = '';
  group = [];
  role = '';
  publicCalendar = [];
  privateCalendar = [];
  lookCalendarName = '';
  lookCalendarInfo = [];
  add = true;
  edit = false;
  color = '#839B91';
  allCalendar = [];
  items = [0, 1];
  count = 1;
  setPermissions = [{ name: '', role: 'student', authority: 'read', group: '' },
  { name: '', role: 'student', authority: 'read', group: '' }];

  constructor(
    private calendarService: CalendarService,
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.tokenService.getUser().subscribe(
      result => {
        this.group = result.groups;
        this.role = result.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.allCalendar.push({ id: calendar.id, name: calendar.name });
          this.group.forEach(group => {
            calendar.permissions.forEach(permission => {
              if (calendar.id === group && permission.role === this.role && permission.authority === 'write' &&
                calendar.display === 'public') {
                this.publicCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
              } else if (calendar.id === group && permission.role === this.role && permission.authority === 'write' &&
                calendar.display === 'private') {
                this.privateCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
              }
            });
          });
        });
      },
      error => {
        console.log(error);
      }
    );
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

  changeToAdd() {
    this.add = true;
    this.edit = false;
  }

  addCalendar() {
    this.setPermissions.forEach(all => {
      const index = this.setPermissions.findIndex(permission => {
        return permission.name.length === 0;
      });
      if (index >= 0) {
        this.setPermissions.splice(index, 1);
        this.items.splice(index, 1);
      }
    });
    this.formData.append('name', this.calendarName);
    this.formData.append('color', this.color);
    this.formData.append('description', this.description);
    this.formData.append('display', this.attribute);
    this.calendarService.postCalendar(this.formData).subscribe(
      data => {
        Swal.fire({
          text: '新增成功',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '返回首頁',
        }).then((result) => {
          if (result.value) {
            this.router.navigate(['/calendar']);
          }
        });
      },
      error => {
        console.log(error);
        Swal.fire({
          text: '新增失敗',
          icon: 'error',
        });
      }
    );
  }

  lookCalendar(info) {
    this.edit = true;
    this.add = false;
    this.lookCalendarName = info.target.innerText;

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          if (calendar.name === this.lookCalendarName) {
            this.lookCalendarInfo.push(calendar);
          }
        });
      }
    );

  }

  addOffice() {
    this.count++;
    this.items.push(this.count);
    this.setPermissions.push({ name: '', role: 'student', authority: 'read', group: '' });
  }

  deleteOffice(index) {
    this.setPermissions.splice(index, 1);
    this.items.splice(index, 1);
  }

  changeOffice(item, info) {
    this.setPermissions[item].name = info.target.value;
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
}
