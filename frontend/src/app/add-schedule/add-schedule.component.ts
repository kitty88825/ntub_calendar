import { UserCommonService } from './../services/user-common.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CalendarService } from '../services/calendar.service';

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
  fileName = [];
  sendEmailForm: FormGroup;
  emailPattern = /^\w+([-+.']\w+)*@ntub.edu.tw(, ?\w+([-+.']\w+)*@ntub.edu.tw)*$/;
  invalidEmails = [];
  isCollapsed = false;
  calendars = [];
  selectedItemsList = [];
  isOpen = false;
  isSubmitted = false;
  isMeet = true;
  isSchedule = !this.isMeet;
  attribute = '';
  allCommonUser = [];
  addCommonUser = [];

  constructor(
    private router: Router,
    public eventService: EventService,
    private formBuilder: FormBuilder,
    private calendarService: CalendarService,
    private userCommonService: UserCommonService
  ) { }

  @ViewChild('addTitle') addTitle: ElementRef;
  @ViewChild('addStartDate') addStartDate: ElementRef;
  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndDate') addEndDate: ElementRef;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;
  @ViewChild('description') description: ElementRef;
  @ViewChild('location') location: ElementRef;

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    this.sendEmailForm = this.formBuilder.group({
      toAddress: ['', Validators.pattern(this.emailPattern)]
    });

    this.calendarService.getCalendar().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.calendars.push({ id: data[i].id, name: data[i].name, isChecked: false });
        }
      }
    );

    this.userCommonService.getCommonUsers().subscribe(
      res => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < res.length; j++) {
          this.allCommonUser.push({ title: res[j].title, participants: res[j].participant });
        }
      }
    );
  }

  changeSelection() {
    this.fetchSelectedItems();
    this.fetchCheckedIDs();
  }

  fetchSelectedItems() {
    this.selectedItemsList = this.calendars.filter((value, index) => {
      return value.isChecked;
    });
  }

  fetchCheckedIDs() {
    this.calendars.forEach((value, index) => {
      if (value.isChecked === true) {
        this.formData.append('calendars', value.id);
      }
    });

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
    console.log(files);
    this.formData.delete('files');
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.formData.append('files', files[i]);
    }
  }

  send(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.sendEmailForm.value.toAddress.split(',');
      this.invalidEmails.push(emails);
      console.log(this.invalidEmails);
      // this.formData.append('participants', emails);
    }
    this.sendEmailForm.reset();
  }

  removeAddUser(index) {
    this.invalidEmails.splice(index, 1);
    // const users = this.formData.getAll('participants');
    // users.splice(index, 1);
    // this.formData.delete('participants');
    // // tslint:disable-next-line: prefer-for-of
    // for (let i = 0; i < users.length; i++) {
    //   this.formData.append('participants', users[i]);
    // }
    console.log(this.invalidEmails);
  }


  add() {
    this.formData.append('attributes', this.attribute);
    this.formData.append('title', this.addTitle.nativeElement.value);
    this.formData.append('start_at', this.addStartDate.nativeElement.value + 'T' + this.addStartTime.model.hour + ':'
      + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
    this.formData.append('end_at', this.addEndDate.nativeElement.value + 'T' + this.addEndTime.model.hour + ':'
      + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');

    this.formData.append('description', this.description.nativeElement.value);
    this.formData.append('location', this.location.nativeElement.value);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.invalidEmails.length; i++) {
      this.formData.append('participants', this.invalidEmails[i]);
    }

    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < this.addCommonUser[0].length; j++) {
      this.formData.append('participants', this.addCommonUser[0][j]);
    }


    this.eventService.postEvent(this.formData).subscribe(
      data => {
        console.log(data);
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

  commonUser(info) {
    this.addCommonUser = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allCommonUser.length; i++) {
      if (info.target.value === this.allCommonUser[i].title) {
        this.addCommonUser.push(this.allCommonUser[i].participants);
      }
    }

    console.log(this.addCommonUser);
  }

}
