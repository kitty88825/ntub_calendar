import { CommonUserService } from './../services/common-user.service';
import { TokenService } from './../services/token.service';
import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShareDataService } from '../services/share-data.service';
import { CalendarService } from '../services/calendar.service';

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
  fileName = [];
  title = '';
  addStart = '';
  showModal: boolean;
  showCalendar: boolean;
  allCommonUser = [];
  addSTime = '';
  addEnd = '';
  location = '';
  description = '';
  users = [];
  id = 0;
  deleteId;
  filesId;
  sendEmailForm: FormGroup;
  emailPattern = /^\w+([-+.']\w+)*@ntub.edu.tw(, ?\w+([-+.']\w+)*@ntub.edu.tw)*$/;
  calendars = [];
  selectedItemsList = [];
  isCheckedCalendars = [];
  userEmail = [];
  isOpen = false;
  isMeet = false;
  isSchedule = false;
  attribute = '';
  group = [];
  role = '';
  MasterSelected = false;
  selectMainCalendar = '';
  commonUserEmail = [];
  allCalendar = [];

  constructor(
    private router: Router,
    public eventService: EventService,
    private formBuilder: FormBuilder,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private tokenService: TokenService,
    private commonUserService: CommonUserService
  ) { }

  isCollapsed = true;


  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;
  @ViewChild('startDate') startDate: ElementRef;
  @ViewChild('endDate') endDate: ElementRef;

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

    this.shareDataService.getMessage().subscribe(
      data => {
        this.id = data.message.id;
        this.title = data.message.title;
        this.attribute = data.message.nature;
        if (this.attribute === 'event') {
          this.isMeet = false;
          this.isSchedule = true;
        } else if (this.attribute === 'meeting') {
          this.isMeet = true;
          this.isSchedule = false;
        }
        this.addStart = data.message.startAt;
        this.startDate.nativeElement.value = this.addStart.substring(0, 10);
        const sHour = this.addStart.substring(11, 13);
        this.addStartTime.model.hour = Number(sHour);
        const sMinute = this.addStart.substring(14, 16);
        this.addStartTime.model.minute = Number(sMinute);
        this.addEnd = data.message.endAt;
        this.endDate.nativeElement.value = this.addEnd.substring(0, 10);
        const eHour = this.addEnd.substring(11, 13);
        this.addEndTime.model.hour = Number(eHour);
        const eMinute = this.addEnd.substring(14, 16);
        this.addEndTime.model.minute = Number(eMinute);
        this.location = data.message.location;
        this.description = data.message.description;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.message.participants.length; i++) {
          this.userEmail.push(data.message.participants[i].email);
          this.formData.append('emails', data.message.participants[i].email);
        }
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < data.message.calendars.length; j++) {
          this.isCheckedCalendars.push(data.message.calendars[j]);
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.message.attachments.length; i++) {
          this.fileName.push(data.message.attachments[i].filename);
          this.formData.append('filesId', data.message.attachments[i].id);
        }
      }
    );

    this.calendarService.getCalendar().subscribe(
      result => {
        result.forEach(re => {
          this.allCalendar.push(re);
          // tslint:disable-next-line: prefer-for-of
          for (let k = 0; k < this.group.length; k++) {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < re.permissions.length; i++) {
              if (this.group[k] === re.permissions[i].group &&
                this.role === re.permissions[i].role && re.permissions[i].authority === 'write') {
                this.calendars.push({ id: re.id, name: re.name, isChecked: false });
              }
            }
          }
        });

        this.isCheckedCalendars.forEach(a => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.calendars.length; i++) {
            if (this.calendars[i].id === a.id) {
              this.selectMainCalendar = this.calendars[i].name;
            }
          }
        });
      }
    );



    this.commonUserService.getCommonUser().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.allCommonUser.push({ id: data[i].id, title: data[i].title, participant: data[i].participant, isChecked: false });
        }
        this.allCommonUser[0].isChecked = true;
        this.allCommonUser[0].participant.forEach(email => {
          this.commonUserEmail.push({ emails: email, isChecked: false });
        });
      }, error => {
        console.log(error);
      }
    );
  }

  CheckUncheckAll() {
    this.fetchSelectedItems();
    this.commonUserEmail.forEach(email => {
      email.isChecked = this.MasterSelected;
    });
  }

  fetchSelectedItems() {
    this.selectedItemsList = this.calendars.filter((value, index) => {
      return value.isChecked;
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

  removeAddUser(index) {
    this.userEmail.splice(index, 1);
    const users = this.formData.getAll('emails');
    users.splice(index, 1);
    this.formData.delete('emails');
    this.userEmail.length = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < users.length; i++) {
      this.formData.append('emails', users[i]);
      this.userEmail.push(users[i]);
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
      console.log(this.deleteId);

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

    console.log(selectFile);
  }

  update() {
    if (this.isMeet === true) {
      this.formData.append('nature', 'meeting');
    } else {
      this.formData.append('nature', 'event');
    }
    this.formData.append('title', this.title);
    this.formData.append('start_at', this.startDate.nativeElement.value + 'T' + this.addStartTime.model.hour + ':'
      + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
    this.formData.append('end_at', this.endDate.nativeElement.value + 'T' + this.addEndTime.model.hour + ':'
      + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

    this.formData.append('description', this.description);
    this.formData.append('location', this.location);

    this.eventService.patchEvent(this.id, this.formData).subscribe(
      data => {
        console.log(data);
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
        console.log(error);
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

  meet(value) {

    if (value.target.checked === true) {
      this.isSchedule = false;
      this.attribute = value.target.value;
    } else {
      this.isSchedule = true;
      this.attribute = '行程';
    }
    console.log(this.attribute);
  }

  schedule(value) {

    if (value.target.checked === true) {
      this.isMeet = false;
      this.attribute = value.target.value;
    } else {
      this.isMeet = true;
      this.attribute = '會議';
    }
    console.log(this.attribute);
  }

  hide() {
    this.showModal = false;
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
    this.commonUserEmail.forEach(email => {
      if (email.isChecked === true) {
        this.userEmail.push(email.emails);
        this.formData.append('emails', email.emails);
      }
    });

    this.hide();
  }


}
