import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { FileUploader, FileLikeObject } from 'ng2-file-upload';
import { concat } from 'rxjs';
import { CalendarService } from '../services/calendar.service';
import { Event } from '../models/event.model';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(
    private router: Router,
    public calendarService: CalendarService
  ) { }

  isCollapsed = true;
  public uploader: FileUploader = new FileUploader({});
  public hasBaseDropZoneOver = false;

  @ViewChild('addTitle') addTitle: ElementRef;
  @ViewChild('addStartDate') addStartDate: ElementRef;
  @ViewChild('addStartTime') addStartTime: NgbTimepicker;
  @ViewChild('addEndDate') addEndDate: ElementRef;
  @ViewChild('addEndTime') addEndTime: NgbTimepicker;
  @ViewChild('description') description: ElementRef;
  @ViewChild('location') location: ElementRef;

  ngOnInit(): void {
  }

  add() {
    const event: Event = {
      id: 1,
      title: this.addTitle.nativeElement.value,
      startAt: this.addStartDate.nativeElement.value + 'T' + this.addStartTime.model.hour + ':'
        + this.addStartTime.model.minute + ':' + this.addStartTime.model.second + '+08:00',
      endAt: this.addEndDate.nativeElement.value + 'T' + this.addEndTime.model.hour + ':'
        + this.addEndTime.model.minute + ':' + this.addEndTime.model.second + '+08:00',
      description: this.description.nativeElement.value,
      location: this.location.nativeElement.value,
      calendars: [1],
    };
    this.calendarService.postEvent(event).subscribe(
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

  fileOverBase(event): void {
    this.hasBaseDropZoneOver = event;
  }

  getFiles(): FileLikeObject[] {
    return this.uploader.queue.map((fileItem) => {
      return fileItem.file;
    });
  }

  upload() {
    const files = this.getFiles();
    console.log(files);
    const requests = [];
    files.forEach((file) => {
      const formData = new FormData();
      formData.append('file', file.rawFile, file.name);
      // requests.push(this.calendarService.upload(formData));
    });

    concat(...requests).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
