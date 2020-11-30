import { formatDate } from '@angular/common';
import { CommonUserService } from './../services/common-user.service';
import { TokenService } from './../services/token.service';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarService } from '../services/calendar.service';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss']
})
export class EditScheduleComponent implements OnInit {
  startTime = { hour: 0, minute: 0, second: 0 };
  endTime = { hour: 0, minute: 0, second: 0 };
  seconds = false;
  spinners = false;
  meridian = true;
  uploadForm: FormGroup;
  formData = new FormData();
  suggestTime = new FormData();
  fileName = [];
  title = '';
  showModal: boolean;
  showCalendar: boolean;
  showTime: boolean;
  allCommonUser = [];
  location = '';
  description = '';
  id = 0;
  deleteId = '';
  filesId = [];
  sendEmailForm: FormGroup;
  emailPattern = /^\w+([-+.']\w+)*@ntub.edu.tw(, ?\w+([-+.']\w+)*@ntub.edu.tw)*$/;
  calendars = [];
  userEmail = [];
  isOpen = false;
  isTrue = false;
  isCollapsed = false;
  isMeet = false;
  isSchedule = false;
  attribute = '';
  group = [];
  role = '';
  myEmail = '';
  MasterSelected = false;
  AllSelected = false;
  selectMainCalendar = '';
  commonUserEmail = [];
  allCalendar = [];
  showAddCalendars = [];
  addCalendarChecked = false;
  mianCalendarId = 0;
  startDate = '';
  endDate = '';
  permission = localStorage.getItem('permission');
  allSuggestTime = [];
  chooseUserEmail = [];
  hasUserEmail = [];
  unsuggestTime: boolean;
  allTimeCan: boolean;

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
    private tokenService: TokenService,
    private commonUserService: CommonUserService
  ) { }

  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;

  ngOnInit(): void {
    this.loading = !this.loading;
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    this.sendEmailForm = this.formBuilder.group({
      toAddress: ['', Validators.pattern(this.emailPattern)]
    });
    this.id = Number(this.router.url.substr(15));

    this.tokenService.getUser().subscribe(
      re => {
        this.group = re.groups;
        this.role = re.role;
        this.myEmail = re.email;
      }
    );

    this.commonUserService.getCommonUser().subscribe(
      data => {
        data.forEach(common => {
          this.allCommonUser.push({ id: common.id, title: common.title, participant: common.participant, isChecked: false });
        });
      }
    );

    this.eventService.getEvent(this.id).subscribe(
      data => {
        this.title = data.title;
        this.attribute = data.nature;
        if (this.attribute === 'event') {
          this.isMeet = false;
          this.isSchedule = true;
        } else if (this.attribute === 'meeting') {
          this.isMeet = true;
          this.isSchedule = false;
        }
        this.startDate = data.startAt.substring(0, 10);
        const sHour = data.startAt.substring(11, 13);
        this.addStartTime.model.hour = Number(sHour);
        const sMinute = data.startAt.substring(14, 16);
        this.addStartTime.model.minute = Number(sMinute);
        this.endDate = data.endAt.substring(0, 10);
        const eHour = data.endAt.substring(11, 13);
        this.addEndTime.model.hour = Number(eHour);
        const eMinute = data.endAt.substring(14, 16);
        this.addEndTime.model.minute = Number(eMinute);
        this.location = data.location;
        this.description = data.description;
        this.mianCalendarId = data.eventinvitecalendarSet[0].mainCalendar.id;
        data.eventparticipantSet.forEach(email => {
          this.userEmail.push({ email: email.user, response: email.response, role: email.role });
          this.formData.append('emails', email.user);
        });

        data.attachments.forEach(file => {
          this.fileName.push({ fileName: file.filename, fileLink: file.file });
          this.formData.append('filesId', file.id);
        });

        this.calendarService.getCalendar().subscribe(
          result => {
            this.userEmail.forEach(email => {
              if (email.role === 'editors') {
                email.response = 'creator';
              }
            });
            result.forEach(re => {
              this.allCalendar.push({
                id: re.id, name: re.name, display: re.display, color: re.color,
                description: re.description, permissions: re.permissions, isChecked: false,
                response: ''
              });
              this.group.forEach(group => {
                re.permissions.forEach(permission => {
                  if (group === permission.group && this.role === permission.role && permission.authority === 'write') {
                    this.calendars.push({ id: re.id, name: re.name, isChecked: false });
                  }
                });
              });
            });

            this.calendars.forEach(calendar => {
              if (this.mianCalendarId === calendar.id) {
                this.selectMainCalendar = calendar.name;
              }
            });
            this.showInviteCalendar(this.selectMainCalendar);

            data.eventinvitecalendarSet.forEach(calendar => {
              this.showAddCalendars.forEach(show => {
                if (calendar.calendar.id === show.id) {
                  show.isChecked = true;
                  show.response = calendar.response;
                }
              });
            });
          }
        );
        this.loading = !this.loading;
      }
    );
  }

  CheckUncheckAll() {
    this.commonUserEmail.forEach(email => {
      email.isChecked = this.MasterSelected;
    });
  }

  send(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.sendEmailForm.value.toAddress.split(',');
      if (this.userEmail.includes(emails[0]) === false) {
        this.userEmail.push({ email: String(emails), response: '' });
        this.formData.append('emails', emails);
      } else {
        Swal.fire({
          text: '該Email已在欲邀請參與人員中',
          icon: 'warning'
        });
      }
    } else {
      Swal.fire({
        text: '請輸入Google信箱',
        icon: 'error',
      });
    }
    this.sendEmailForm.reset();
  }

  removeAddUser(index) {
    this.userEmail.splice(index, 1);
    const users = this.formData.getAll('emails');
    users.splice(index, 1);
    this.formData.delete('emails');
    users.forEach(user => {
      this.formData.append('emails', user);
    });
  }

  chooseUser() {
    const userEmails = [];
    this.AllSelected = false;
    let count = 0;
    const common = [];
    this.commonUserEmail.forEach(email => {
      if (email.isChecked === true) {
        count++;
        userEmails.push(email.emails);
        this.chooseUserEmail.push({ emails: email.emails, isChecked: false });
      }
    });

    this.chooseUserEmail.forEach(email => {
      this.hasUserEmail.push(email.emails);
    });

    this.commonUserEmail.forEach(email => {
      const index = userEmails.findIndex(a => {
        return a === email.emails;
      });
      if (index === -1) {
        common.push(email);
      }
    });

    if (userEmails.length !== 0) {
      this.commonUserEmail = [];
      this.commonUserEmail = common;
    }

    this.MasterSelected = false;

  }

  removeChooseUser() {
    let count = 0;
    const userEmails = [];
    const choose = [];
    this.chooseUserEmail.forEach(email => {
      if (email.isChecked === true) {
        count++;
        this.commonUserEmail.push({ emails: email.emails, isChecked: false });
        userEmails.push(email.emails);
      }
    });

    this.chooseUserEmail.forEach(email => {
      const index = userEmails.findIndex(a => {
        return a === email.emails;
      });
      if (index === -1) {
        choose.push(email);
      }
    });

    if (userEmails.length !== 0 && count !== 0) {
      this.chooseUserEmail = [];
      this.hasUserEmail = [];
      this.chooseUserEmail = choose;
      choose.forEach(email => {
        this.hasUserEmail.push(email.emails);
      });
    }
    this.AllSelected = false;
  }

  chooseUserEmailAll() {
    this.chooseUserEmail.forEach(email => {
      email.isChecked = this.AllSelected;
    });
  }

  changeChooseEmail() {
    let count = 0;
    this.chooseUserEmail.forEach(emails => {
      if (emails.isChecked === true) {
        count++;
      }
    });
    if (count === this.chooseUserEmail.length) {
      this.AllSelected = true;
    } else {
      this.AllSelected = false;
    }
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
    const initLenght = this.formData.getAll('filesId').length;
    this.fileName.splice(index, 1);

    if (initLenght > index) {
      this.filesId = this.formData.getAll('filesId');
      this.deleteId = this.filesId[index];

      this.filesId.splice(index, 1);
      this.formData.delete('filesId');
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.filesId.length; i++) {
        this.formData.append('filesId', this.filesId[i]);
      }

      this.formData.append('remove_files', this.deleteId);
    }

    const selectFile = this.formData.getAll('files');
    selectFile.splice(index - this.formData.getAll('filesId').length, 1);

    this.formData.delete('files');
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < selectFile.length; i++) {
      this.formData.append('files', selectFile[i]);
    }
  }

  async update(main: HTMLElement) {
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
    } else if (end.toUpperCase() < start.toUpperCase()) {
      Swal.fire({
        text: '請輸入正確日期',
        icon: 'error'
      });
    } else {
      this.loading = !this.loading;
      this.showAddCalendars.forEach(calendar => {
        if (calendar.isChecked === true) {
          this.formData.append('invite_calendars_id', calendar.id);
        }
      });
      if (this.isMeet === true) {
        this.formData.append('nature', 'meeting');
      } else {
        this.formData.append('nature', 'event');
      }
      this.formData.append('title', this.title);
      this.formData.append('start_at', start + 'T' + this.addStartTime.model.hour + ':'
        + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
      this.formData.append('end_at', end + 'T' + this.addEndTime.model.hour + ':'
        + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');
      this.formData.append('description', this.description);
      this.formData.append('location', this.location);

      this.eventService.patchEvent(this.id, this.formData).subscribe(
        data => {
          this.loading = !this.loading;
          Swal.fire({
            text: '更新成功',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '返回首頁',
          }).then((result) => {
            if (result.value) {
              this.router.navigate(['/calendar']);
            }
          });
        },
        error => {
          this.loading = !this.loading;
          Swal.fire({
            text: '更新失敗',
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: '返回首頁',
            cancelButtonText: '取消'
          }).then((result) => {
            if (result.value) {
              this.router.navigate(['/calendar']);
            }
          });
        }
      );
    }
  }

  meet(value) {
    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = '行程';
    }
  }

  schedule(value) {
    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = '會議';
    }
  }

  hide() {
    this.showModal = false;
  }

  hideTime() {
    this.showTime = false;
  }

  commonUser() {
    this.showModal = true;
  }

  inviteCalendar() {
    this.showCalendar = true;
  }

  hideCalendar() {
    this.showCalendar = false;
  }

  changeSelectCommon() {
    this.AllSelected = false;
    this.MasterSelected = false;
    this.commonUserEmail = [];
    let userEmails = [];
    this.allCommonUser.forEach(common => {
      if (common.isChecked === true) {
        common.participant.forEach(email => {
          const index = this.hasUserEmail.findIndex(e => {
            return e === email;
          });

          if (index === -1) {
            userEmails.push(email);
          }
        });
      }
    });
    userEmails = userEmails.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    userEmails.forEach(email => {
      this.commonUserEmail.push({ emails: email, isChecked: false });
    });
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

  importEmail() {
    this.chooseUserEmail.forEach(email => {
      this.userEmail.push({ email: email.emails, response: '' });
      this.formData.append('emails', email.emails);
    });
    this.userEmailFiter();
    console.log(this.userEmail);
    this.hide();
  }

  userEmailFiter() {
    this.userEmail = this.userEmail.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });
  }

  changeSelectCalendar(calendarName) {
    this.showAddCalendars = [];
    this.showInviteCalendar(calendarName);
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
          this.suggestTime.append('emails', email.email);
        });
        this.suggestTime.append('start_at', start + 'T' + this.addStartTime.model.hour + ':'
          + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
        this.suggestTime.append('end_at', end + 'T' + this.addEndTime.model.hour + ':'
          + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

        this.eventService.postSuggestTime(this.suggestTime).subscribe(
          data => {
            if (data === 'All participants can attend!') {
              this.allTimeCan = true;
            } else if (data === 'No suggested time!') {
              this.unsuggestTime = true;
            } else {
              data.forEach(time => {
                this.allSuggestTime.push({
                  startDate: time[0].substr(0, 10), startTime: time[0].substr(11, 5),
                  endDate: time[1].substr(0, 10), endTime: time[1].substr(11, 5), isChecked: false
                });
              });
            }
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

  showInviteCalendar(calendarName) {
    const allCalendar = this.allCalendar.slice();
    const index = this.allCalendar.findIndex(calendar => calendar.name === calendarName);
    allCalendar.splice(index, 1);
    this.showAddCalendars = allCalendar;
  }

}
