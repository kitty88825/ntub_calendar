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
  description = '';
  group = [];
  role = '';
  publicCalendar = [];
  privateCalendar = [];
  permissionCalendar = [];
  lookCalendarName = '';
  lookCalendarInfo = [];
  add = true;
  edit = false;
  color = '#839B91';
  allCalendar = [];
  raw = { name: '', display: '', description: '', color: '', permissions: [{ id: 0, authority: '', group: [], groupName: '', role: '' }] };
  items = [0, 1];
  calendarPermissions = [];
  count = 1;
  setPermissions = [{ id: 0, groupName: '', role: 'student', authority: 'read', group: [] },
  { id: 0, groupName: '', role: 'student', authority: 'read', group: [] }];

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
              if (permission.group === group && permission.role === this.role && permission.authority === 'write' &&
                calendar.display === 'public') {
                this.publicCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
                this.permissionCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
              } else if (permission.group === group && permission.role === this.role && permission.authority === 'write' &&
                calendar.display === 'private') {
                this.privateCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
                this.permissionCalendar.push({ id: calendar.id, name: calendar.name, color: calendar.color });
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
    this.calendarName = '';
    this.color = '#839B91';
    this.description = '';
    this.attribute = 'public';
    this.isMeet = true;
    this.isSchedule = false;
  }

  addCalendar() {
    this.setPermissions.forEach(all => {
      const index = this.setPermissions.findIndex(permission => {
        return permission.groupName.length === 0;
      });
      if (index >= 0) {
        this.setPermissions.splice(index, 1);
        this.items.splice(index, 1);
      }
    });

    this.raw.name = this.calendarName;
    this.raw.description = this.description;
    this.raw.color = this.color;
    this.raw.display = this.attribute;
    if (this.setPermissions[0].groupName === '') {
      Swal.fire({
        text: '請至少輸入一個權限',
        icon: 'error'
      });
    } else if (this.setPermissions.length === 1 && this.setPermissions[0].groupName !== '') {
      this.raw.permissions[0].id = this.setPermissions[0].id;
      this.raw.permissions[0].groupName = this.setPermissions[0].groupName;
      this.raw.permissions[0].role = this.setPermissions[0].role;
      this.raw.permissions[0].authority = this.setPermissions[0].authority;
      this.raw.permissions[0].group = this.setPermissions[0].group;
    } else if (this.setPermissions.length > 1) {
      const count = this.setPermissions.length - 1;
      for (let j = 0; j < count; j++) {
        this.raw.permissions.push({ authority: '', group: [], groupName: '', role: '', id: 0 });
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.setPermissions.length; i++) {
        this.raw.permissions[i].id = this.setPermissions[i].id;
        this.raw.permissions[i].groupName = this.setPermissions[i].groupName;
        this.raw.permissions[i].role = this.setPermissions[i].role;
        this.raw.permissions[i].authority = this.setPermissions[i].authority;
        this.raw.permissions[i].group = this.setPermissions[i].group;
      }
    }

    this.calendarService.postCalendar(this.raw).subscribe(
      data => {
        Swal.fire({
          text: '新增成功',
          icon: 'success',
        }).then((result) => {
          if (result.value) {
            window.location.reload();
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
    this.lookCalendarName = info;
    this.lookCalendarInfo = [];
    this.calendarPermissions = [];

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          if (calendar.name === this.lookCalendarName) {
            this.lookCalendarInfo.push(calendar);
            this.calendarName = this.lookCalendarInfo[0].name;
            this.color = this.lookCalendarInfo[0].color;
            this.description = this.lookCalendarInfo[0].description;
            this.attribute = this.lookCalendarInfo[0].display;
            if (this.attribute === 'public') {
              this.isMeet = true;
              this.isSchedule = false;
            } else {
              this.isSchedule = true;
              this.isMeet = false;
            }
            calendar.permissions.forEach(permission => {
              this.calendarPermissions.push(permission);
            });
          }
        });
      }
    );

  }

  addOffice() {
    if (this.add === true) {
      this.count++;
      this.items.push(this.count);
      this.setPermissions.push({ groupName: '', role: 'student', authority: 'read', group: [], id: 0 });
    } else if (this.edit === true) {
      this.calendarPermissions.push({ id: 0, authority: 'read', group: [], groupName: '', role: 'student' });
    }
  }

  deleteOffice(index) {
    this.setPermissions.splice(index, 1);
    this.items.splice(index, 1);
    this.calendarPermissions.splice(index, 1);
  }

  changeOffice(item, info) {
    if (this.add === true) {
      this.setPermissions[item].groupName = info.target.value;
      this.allCalendar.forEach(calendar => {
        if (calendar.name === info.target.value) {
          this.setPermissions[item].group = calendar.id;
        }
      });
    } else if (this.add === false) {
      this.calendarPermissions[item].groupName = info.target.value;
      this.allCalendar.forEach(calendar => {
        if (calendar.name === info.target.value) {
          this.calendarPermissions[item].group = calendar.id;
        }
      });
    }

  }

  changeRole(item, info) {
    this.setPermissions[item].role = info.target.value;
  }

  changeAuthority(item, info) {
    this.setPermissions[item].authority = info.target.value;
  }

  editCalendar() {
    if (this.calendarPermissions.length === 0) {
      Swal.fire({
        text: '請至少輸入一個權限',
        icon: 'error'
      });
    } else if (this.calendarPermissions.length !== 0) {
      this.calendarPermissions.forEach(all => {
        const index = this.calendarPermissions.findIndex(permission => {
          return permission.groupName.length === 0;
        });
        if (index >= 0) {
          this.calendarPermissions.splice(index, 1);
        }
      });

      this.raw.name = this.lookCalendarName;
      this.raw.color = this.color;
      this.raw.description = this.description;
      this.raw.display = this.attribute;
      if (this.calendarPermissions[0].groupName === '') {
        Swal.fire({
          text: '請至少輸入一個權限',
          icon: 'error'
        });
      } else if (this.calendarPermissions.length === 1 && this.calendarPermissions[0].groupName !== '') {
        this.raw.permissions[0].id = this.calendarPermissions[0].id;
        this.raw.permissions[0].groupName = this.calendarPermissions[0].groupName;
        this.raw.permissions[0].role = this.calendarPermissions[0].role;
        this.raw.permissions[0].authority = this.calendarPermissions[0].authority;
        this.raw.permissions[0].group = this.calendarPermissions[0].group;
      } else if (this.calendarPermissions.length > 1) {
        const count = this.calendarPermissions.length - 1;
        for (let j = 0; j < count; j++) {
          this.raw.permissions.push({ authority: '', group: [], groupName: '', role: '', id: 0 });
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.calendarPermissions.length; i++) {
          this.raw.permissions[i].id = this.calendarPermissions[i].id;
          this.raw.permissions[i].groupName = this.calendarPermissions[i].groupName;
          this.raw.permissions[i].role = this.calendarPermissions[i].role;
          this.raw.permissions[i].authority = this.calendarPermissions[i].authority;
          this.raw.permissions[i].group = this.calendarPermissions[i].group;
        }
      }

      console.log(this.raw);

      this.permissionCalendar.forEach(calendar => {
        if (calendar.name === this.lookCalendarName) {
          this.calendarService.patchCalendar(calendar.id, this.raw).subscribe(
            data => {
              Swal.fire({
                text: '更新成功',
                icon: 'success'
              }).then((result) => {
                window.location.reload();
              });
            }, error => {
              Swal.fire({
                text: '更新失敗',
                icon: 'error'
              });
            }
          );
        }
      });

    }

  }

  deleteCalendar() {
    Swal.fire({
      text: '確定要刪除「' + this.lookCalendarName + '」?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.permissionCalendar.forEach(calendar => {
          if (calendar.name === this.lookCalendarName) {
            this.calendarService.deleteCalendar(calendar.id).subscribe(
              data => {
                Swal.fire({
                  text: '刪除成功',
                  icon: 'success'
                }).then((yes) => {
                  window.location.reload();
                });
              }, error => {
                Swal.fire({
                  text: '刪除失敗',
                  icon: 'error'
                });
              }
            );
          }
        });
      }
    });

  }
}
