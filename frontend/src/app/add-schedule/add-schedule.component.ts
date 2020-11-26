import { TokenService } from './../services/token.service';
import { UserCommonService } from './../services/user-common.service';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CalendarService } from '../services/calendar.service';
import { formatDate } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-add-schedule',
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.scss']
})
export class AddScheduleComponent implements OnInit {
  startTime = { hour: 0, minute: 0, second: 0 };
  endTime = { hour: 0, minute: 0, second: 0 };
  seconds = false;
  spinners = false;
  meridian = true;
  uploadForm: FormGroup;
  formData = new FormData();
  suggestTime = new FormData();
  fileName = [];
  sendEmailForm: FormGroup;
  emailPattern = /^\w+([-+.']\w+)*@ntub.edu.tw(, ?\w+([-+.']\w+)*@ntub.edu.tw)*$/;
  calendars = [];
  allCalendars = [];
  showAddCalendars = [];
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  isMeet = true;
  isSchedule = !this.isMeet;
  attribute = 'meeting';
  allCommonUser = [];
  group = [];
  role = '';
  selectMainCalendar = '';
  showCalendar: boolean;
  showModal: boolean;
  showTime: boolean;
  commonUserEmail = [];
  MasterSelected = false;
  userEmail = [];
  addCalendarChecked = false;
  title = '';
  description = '';
  location = '';
  startDate = '';
  endDate = '';
  staff = localStorage.getItem('staff');
  allSuggestTime = [];


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
    private router: Router,
    public eventService: EventService,
    private formBuilder: FormBuilder,
    private calendarService: CalendarService,
    private userCommonService: UserCommonService,
    private tokenService: TokenService
  ) { }

  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    this.sendEmailForm = this.formBuilder.group({
      toAddress: ['', Validators.pattern(this.emailPattern)]
    });

    this.tokenService.getUser().subscribe(
      re => {
        this.group = re.groups;
        this.role = re.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      result => {
        result.forEach(re => {
          this.allCalendars.push({ id: re.id, name: re.name, isChecked: false });

          this.group.forEach(group => {
            re.permissions.forEach(permission => {
              if (group === permission.group &&
                this.role === permission.role && permission.authority === 'write') {
                this.calendars.push({ id: re.id, name: re.name, isChecked: false });
              }
            });
          });
        });

        if (this.calendars.length !== 0) {
          this.selectMainCalendar = this.calendars[0].name;
        }

        this.showInviteCalendar(this.selectMainCalendar);

        if (this.calendars.length === 0) {
          Swal.fire({
            text: '您無任何行事曆新增權限',
            icon: 'warning'
          });
        }
      }
    );

    this.userCommonService.getCommonUsers().subscribe(
      res => {
        res.forEach(common => {
          this.allCommonUser.push({ title: common.title, participant: common.participant, isChecked: false });
        });
        this.allCommonUser[0].isChecked = true;
        this.allCommonUser[0].participant.forEach(email => {
          this.commonUserEmail.push({ emails: email, isChecked: false });
        });
      }
    );
  }

  fileSelected(event) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      this.uploadForm.get('profile').setValue(file);
      this.formData.append('files', this.uploadForm.get('profile').value);
      this.fileName.push(this.uploadForm.get('profile').value.name);
    }
  }

  removeSelectedFile(index) {
    this.fileName.splice(index, 1);
    const files = this.formData.getAll('files');
    files.splice(index, 1);
    this.formData.delete('files');
    files.forEach(file => {
      this.formData.append('files', file);
    });
  }

  send(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.sendEmailForm.value.toAddress.split(',');
      this.userEmail.push(emails);
      this.formData.append('emails', emails);
    } else {
      Swal.fire({
        text: '請輸入Google信箱',
        icon: 'error',
      });
    }
    this.sendEmailForm.reset();
  }

  changeSelectEmail() {
    let count = 0;
    this.commonUserEmail.forEach(emails => {
      if (emails.isChecked === true) {
        count++;
      }
    });
    if (count === this.commonUserEmail.length) {
      this.MasterSelected = true;
    } else {
      this.MasterSelected = false;
    }
  }

  removeAddUser(index) {
    this.userEmail.splice(index, 1);
    const users = this.formData.getAll('emails');
    users.splice(index, 1);
    this.formData.delete('emails');
    this.userEmail.length = 0;
    users.forEach(user => {
      this.formData.append('emails', user);
      this.userEmail.push(user);
    });
  }

  async add(main: HTMLElement) {
    if (this.startDate.length === 0 || this.endDate.length === 0) {
      Swal.fire({
        text: '請輸入時間',
        icon: 'warning'
      });
    } else {
      const start = formatDate(this.startDate, 'yyyy-MM-dd', 'en');
      const end = formatDate(this.endDate, 'yyyy-MM-dd', 'en');
      await new Promise(resolve => {
        setTimeout(() => {
          main.scrollIntoView();
          resolve();
        });
      });

      if (this.title === '') {
        Swal.fire({
          text: '請輸入標題',
          icon: 'error'
        });
      } else if (start.toUpperCase() > end.toUpperCase()) {
        Swal.fire({
          text: '請輸入正確時間',
          icon: 'error'
        });
      } else {
        this.loading = !this.loading;
        this.calendars.forEach(calendar => {
          if (this.selectMainCalendar === calendar.name) {
            this.formData.append('main_calendar_id', calendar.id);
          }
        });
        this.showAddCalendars.forEach(calendar => {
          if (calendar.isChecked === true) {
            this.formData.append('invite_calendars_id', calendar.id);
          }
        });
        this.formData.append('nature', this.attribute);
        this.formData.append('title', this.title);
        this.formData.append('start_at', start + 'T' + this.addStartTime.model.hour + ':'
          + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
        this.formData.append('end_at', end + 'T' + this.addEndTime.model.hour + ':'
          + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

        this.formData.append('description', this.description);
        this.formData.append('location', this.location);
        this.userEmail.forEach(email => {
          this.formData.append('emails', email);
        });

        this.eventService.postEvent(this.formData).subscribe(
          data => {
            this.loading = !this.loading;
            Swal.fire({
              text: '新增成功',
              icon: 'success',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#aaa',
              confirmButtonText: '返回首頁',
              cancelButtonText: '再添一筆'
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
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#aaa',
              confirmButtonText: '返回首頁',
              cancelButtonText: '再添一筆'
            }).then((result) => {
              if (result.value) {
                this.router.navigate(['/calendar']);
              }
            });
          }
        );

      }
    }
  }

  showInviteCalendar(calendarName) {
    const allCalendar = this.allCalendars.slice();
    const index = this.allCalendars.findIndex(calendar => calendar.name === calendarName);
    allCalendar.splice(index, 1);
    this.showAddCalendars = allCalendar;
  }

  meet(value) {
    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = 'event';
    }
  }

  importEmail() {
    this.commonUserEmail.forEach(email => {
      if (email.isChecked === true) {
        this.formData.append('emails', email.emails);
        this.userEmail.push(email.emails);
      }
    });
    this.hide();
  }

  schedule(value) {
    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = 'meeting';
    }
  }

  inviteCalendar() {
    this.showCalendar = true;
  }

  hideCalendar() {
    this.showCalendar = false;
  }

  hideTime() {
    this.showTime = false;
  }

  hide() {
    this.showModal = false;
  }

  OpencommonUser() {
    this.showModal = true;
  }

  CheckUncheckAll() {
    this.commonUserEmail.forEach(email => {
      email.isChecked = this.MasterSelected;
    });
  }

  changeSelectCommon(info) {
    this.commonUserEmail = [];
    this.allCommonUser.forEach(common => {
      common.isChecked = false;
      if (info === common.title) {
        common.isChecked = true;
        common.participant.forEach(email => {
          this.commonUserEmail.push({ emails: email, isChecked: false });
        });
      }
    });
  }

  changeSelectCalendar(calendarName) {
    this.showAddCalendars = [];
    this.showInviteCalendar(calendarName);
  }

  addCalendar() {
    this.showCalendar = false;
  }

  checkAllAddCalendar(info) {
    this.showAddCalendars.forEach(calendar => calendar.isChecked = info.target.checked);
  }

  changeAddCalendar() {
    let count = 0;
    const all = this.showAddCalendars.length;

    this.showAddCalendars.forEach(calendar => {
      if (calendar.isChecked === true) {
        count++;
      }
    });

    if (count === all) {
      this.addCalendarChecked = true;
    } else {
      this.addCalendarChecked = false;
    }
  }

  adviseTime() {
    this.allSuggestTime = [];

    if (this.startDate.length === 0 || this.endDate.length === 0) {
      Swal.fire({
        text: '請先輸入日期與時間',
        icon: 'warning'
      });
    } else {
      if (this.userEmail.length === 0) {
        Swal.fire({
          text: '請輸入至少一位參與人員',
          icon: 'warning'
        });
      } else {
        const start = formatDate(this.startDate, 'yyyy-MM-dd', 'en');
        const end = formatDate(this.endDate, 'yyyy-MM-dd', 'en');

        this.showTime = true;
        this.userEmail.forEach(email => {
          this.suggestTime.append('emails', email);
        });
        this.suggestTime.append('start_at', start + 'T' + this.addStartTime.model.hour + ':'
          + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
        this.suggestTime.append('end_at', end + 'T' + this.addEndTime.model.hour + ':'
          + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

        this.eventService.postSuggestTime(this.suggestTime).subscribe(
          data => {
            data.forEach(time => {
              this.allSuggestTime.push({
                startDate: time[0].substr(0, 10), startTime: time[0].substr(11, 5),
                endDate: time[1].substr(0, 10), endTime: time[1].substr(11, 5), isChecked: false
              });
            });
          }
        );
      }
    }

  }

  chooseSuggestTime() {
    this.allSuggestTime.forEach(time => {
      if (time.isChecked === true) {
        this.startDate = time.startDate;
        this.endDate = time.endDate;
        this.addStartTime.model.hour = Number(time.startTime.substr(0, 2));
        this.addStartTime.model.minute = time.startTime.substr(3, 2);
        this.addEndTime.model.hour = time.endTime.substr(0, 2);
        this.addEndTime.model.minute = time.endTime.substr(3, 2);
      }
    });
    this.showTime = false;
  }

  changeSuggestTime(index) {
    this.allSuggestTime.forEach(time => {
      time.isChecked = false;
    });

    this.allSuggestTime[index].isChecked = true;

  }

  changeTime() {
    this.allSuggestTime = [];
    const start = formatDate(this.startDate, 'yyyy-MM-dd', 'en');
    const end = formatDate(this.endDate, 'yyyy-MM-dd', 'en');

    this.suggestTime.append('start_at', start + 'T' + this.addStartTime.model.hour + ':'
      + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
    this.suggestTime.append('end_at', end + 'T' + this.addEndTime.model.hour + ':'
      + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

    this.eventService.postSuggestTime(this.suggestTime).subscribe(
      data => {
        data.forEach(time => {
          this.allSuggestTime.push({
            startDate: time[0].substr(0, 10), startTime: time[0].substr(11, 5),
            endDate: time[1].substr(0, 10), endTime: time[1].substr(11, 5), isChecked: false
          });
        });
      }
    );
  }

}
