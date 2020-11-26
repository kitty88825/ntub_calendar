import { TokenService } from './../services/token.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CalendarService } from './../services/calendar.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-add-calendar',
  templateUrl: './add-calendar.component.html',
  styleUrls: ['./add-calendar.component.scss']
})
export class AddCalendarComponent implements OnInit {
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
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
  addSmall = false;
  edit = false;
  editSmall = false;
  color = '#839B91';
  allCalendar = [
    { id: 1, name: '秘書室' },
    { id: 2, name: '副校長室'},
    { id: 3, name: '校長室'},
    { id: 4, name: '軍訓室'},
    { id: 5, name: '主計室'},
    { id: 6, name: '人事室'},
    { id: 7, name: '圖書館'},
    { id: 8, name: '總務處'},
    { id: 9, name: '專科進修學校'},
    { id: 10, name: '空中進修學院'},
    { id: 11, name: '校務研究中心'},
    { id: 12, name: '教學發展中心'},
    { id: 13, name: '學生事務處'},
    { id: 14, name: '國際事務處'},
    { id: 15, name: '研究發展處'},
    { id: 16, name: '教務處'},
    { id: 17, name: '資訊與網路中心'},
    { id: 18, name: '體育室'},
    { id: 19, name: '通識教育中心'},
    { id: 20, name: '商品創意經營系'},
    { id: 21, name: '商業設計管理系'},
    { id: 22, name: '數位多媒體設計系'},
    { id: 23, name: '創意設計與經營研究所'},
    { id: 24, name: '創新經營學院'},
    { id: 25, name: '資訊與決策科學研究所'},
    { id: 26, name: '應用外語系'},
    { id: 27, name: '資訊管理系'},
    { id: 28, name: '企業管理系(所)'},
    { id: 29, name: '管理學院'},
    { id: 30, name: '貿易實務法律暨談判碩士學位學程'},
    { id: 31, name: '國際商務系(所)'},
    { id: 32, name: '財務金融系(所)'},
    { id: 33, name: '會計資訊系(所)'},
    { id: 34, name: '財經學院'},
    { id: 35, name: '開發人員'}
  ];
  raw = { name: '', display: '', description: '', color: '', permissions: [{ authority: '', group: 0, groupName: '', role: '' }] };
  items = [0, 1];
  calendarPermissions = [];
  count = 1;
  setRole = 'write';
  setPermissions = [{ groupName: '', role: 'student', authority: 'write', group: 0 },
  { groupName: '', role: 'student', authority: 'write', group: 0 }];
  staff = localStorage.getItem('staff');

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
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;
    this.tokenService.getUser().subscribe(
      result => {
        this.group = result.groups;
        this.role = result.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
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
        this.loading = !this.loading;
      },
      error => {
        Swal.fire({
          text: '獲取資料失敗',
          icon: 'error'
        });
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
    this.addSmall = true;
    this.editSmall = false;
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
    if (this.setPermissions[0].authority === 'read') {
      Swal.fire({
        text: '請至少輸入一個可寫權限',
        icon: 'error'
      });
    } else if (this.setPermissions.length === 1 && this.setPermissions[0].groupName !== '') {
      this.raw.permissions[0].groupName = this.setPermissions[0].groupName;
      this.raw.permissions[0].role = this.setPermissions[0].role;
      this.raw.permissions[0].authority = this.setPermissions[0].authority;
      this.raw.permissions[0].group = this.setPermissions[0].group;

      console.log(this.raw);

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

    } else if (this.setPermissions.length > 1) {
      const count = this.setPermissions.length - 1;
      for (let j = 0; j < count; j++) {
        this.raw.permissions.push({ authority: '', group: 0, groupName: '', role: ''});
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.setPermissions.length; i++) {
        this.raw.permissions[i].groupName = this.setPermissions[i].groupName;
        this.raw.permissions[i].role = this.setPermissions[i].role;
        this.raw.permissions[i].authority = this.setPermissions[i].authority;
        this.raw.permissions[i].group = this.setPermissions[i].group;
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
  }

  lookCalendar(info) {
    this.loading = !this.loading;
    this.edit = true;
    this.add = false;
    this.addSmall = false;
    this.editSmall = true;
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
        this.loading = !this.loading;
      }
    );

  }

  addOffice() {
    if (this.add === true) {
      this.count++;
      this.items.push(this.count);
      this.setPermissions.push({ groupName: '', role: 'student', authority: 'write', group: 0});
    } else if (this.edit === true) {
      this.calendarPermissions.push({ id: 0, authority: 'write', group: [], groupName: '', role: 'student' });
    }
  }

  cancelAdd() {
    this.addSmall = false;
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
        this.raw.permissions[0].groupName = this.calendarPermissions[0].groupName;
        this.raw.permissions[0].role = this.calendarPermissions[0].role;
        this.raw.permissions[0].authority = this.calendarPermissions[0].authority;
        this.raw.permissions[0].group = this.calendarPermissions[0].group;
      } else if (this.calendarPermissions.length > 1) {
        const count = this.calendarPermissions.length - 1;
        for (let j = 0; j < count; j++) {
          this.raw.permissions.push({ authority: '', group: 0, groupName: '', role: ''});
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.calendarPermissions.length; i++) {
          this.raw.permissions[i].groupName = this.calendarPermissions[i].groupName;
          this.raw.permissions[i].role = this.calendarPermissions[i].role;
          this.raw.permissions[i].authority = this.calendarPermissions[i].authority;
          this.raw.permissions[i].group = this.calendarPermissions[i].group;
        }
      }
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
