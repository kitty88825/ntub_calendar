import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { CalendarService } from '../services/calendar.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShareDataService } from '../services/share-data.service';

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
  addStartDate = '';
  addSTime = '';
  addEnd = '';
  addEndDate = '';
  location = '';
  description = '';
  id = 0;
  deleteId;
  filesId;

  constructor(
    private router: Router,
    public calendarService: CalendarService,
    private formBuilder: FormBuilder,
    private shareDataService: ShareDataService
  ) { }

  isCollapsed = true;


  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    this.shareDataService.getMessage().subscribe(
      data => {
        this.id = data.message.id;
        this.title = data.message.title;
        this.addStart = data.message.startAt;
        this.addStartDate = this.addStart.substring(0, 10);
        const sHour = this.addStart.substring(11, 13);
        this.addStartTime.model.hour = Number(sHour);
        const sMinute = this.addStart.substring(14, 16);
        this.addStartTime.model.minute = Number(sMinute);
        this.addEnd = data.message.endAt;
        this.addEndDate = this.addEnd.substring(0, 10);
        const eHour = this.addEnd.substring(11, 13);
        this.addEndTime.model.hour = Number(eHour);
        const eMinute = this.addEnd.substring(14, 16);
        this.addEndTime.model.minute = Number(eMinute);
        this.location = data.message.location;
        this.description = data.message.description;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.message.attachments.length; i++) {
          this.fileName.push(data.message.attachments[i].filename);
          this.formData.append('filesId', data.message.attachments[i].id);
        }
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
    const initLenght = this.formData.getAll('filesId').length;
    console.log(initLenght);
    this.fileName.splice(index, 1);

    if (initLenght > index) {
      this.filesId = this.formData.getAll('filesId');
      console.log(this.filesId);
      this.deleteId = this.filesId[index];
      console.log(this.deleteId);
      this.filesId.splice(index, 1);
      console.log(this.filesId);
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


  update() {
    this.formData.append('title', this.title);
    this.formData.append('start_at', this.addStartDate + 'T' + this.addStartTime.model.hour + ':'
      + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00');
    this.formData.append('end_at', this.addEndDate + 'T' + this.addEndTime.model.hour + ':'
      + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00');
    this.formData.append('calendars', [1].toString());

    this.formData.append('description', this.description);
    this.formData.append('location', this.location);

    this.calendarService.patchEvent(this.id, this.formData).subscribe(
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


}
