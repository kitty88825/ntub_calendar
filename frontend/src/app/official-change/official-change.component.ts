import { TokenService } from './../services/token.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';
import { DatePipe } from '@angular/common';
import { CalendarService } from '../services/calendar.service';

type AOA = any[];

@Component({
  selector: 'app-official-change',
  templateUrl: './official-change.component.html',
  styleUrls: ['./official-change.component.scss'],
  providers: [DatePipe]
})
export class OfficialChangeComponent implements OnInit {
  data: AOA;
  formData = new FormData();
  datas = [];
  header = ['發布標題', '內容概要', '發布單位', '開始日期', '結束日期'];
  istrue = 0;
  selectedValue = '';
  group = [];
  role = '';
  isCollapsed = false;
  permissionCalendars = [];

  // tslint:disable-next-line: member-ordering
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor(
    private router: Router,
    private eventService: EventService,
    private calendarService: CalendarService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.tokenService.getUser().subscribe(
      data => {
        this.group = data.groups;
        this.role = data.role;
      }
    );

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.group.forEach(group => {
            calendar.permissions.forEach(permission => {
              if (permission.group === group && permission.role === this.role && permission.authority === 'write') {
                this.permissionCalendars.push({ id: calendar.id, name: calendar.name, color: calendar.color });
              }
            });
          });
        });
      },
      error => {
        Swal.fire({
          text: '獲取資料失敗',
          icon: 'error'
        });
      }
    );

  }

  add() {
    this.datas.forEach(event => {
      if (typeof event[0] === 'string' && event[3].length === 10 &&
        event[4].length === 10 && this.selectedValue.length !== 0) {
        this.istrue = this.istrue + 1;
      } else {
        Swal.fire({
          text: '請輸入正確資料',
          icon: 'error'
        });
      }
    });

    if (this.istrue === this.datas.length) {
      this.datas.forEach(event => {
        this.permissionCalendars.forEach(calendar => {
          if (calendar.name === event[2]) {
            this.formData.append('main_calendar_id', calendar.id);
          }
        });
        this.formData.append('title', event[0]);
        this.formData.append('description', event[1]);
        this.formData.append('start_at', event[3] + 'T00:00:00+08:00');
        this.formData.append('end_at', event[4] + 'T00:00:00+08:00');
        this.eventService.postEvent(this.formData).subscribe(
          data => {
            console.log(data);
            Swal.fire({
              text: '新增成功',
              icon: 'success',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#aaa',
              confirmButtonText: '回首頁',
              cancelButtonText: '留在此頁',
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
      });
    }

  }

  onChange() {
    this.permissionCalendars.forEach(calendar => {
      if (this.selectedValue === calendar[1]) {
        this.formData.append('main_calendar_id', calendar[0]);
      }
    });
  }

  onFileChange(evt: any) {
    this.data = [];
    this.datas = [];
    let count = 0;
    const permissionCalendarsCount = this.permissionCalendars.length;
    /* wire up file reader */
    const target: DataTransfer = (evt.target) as DataTransfer;
    if (target.files.length > 1) {
      Swal.fire({
        text: '請勿選擇多個檔案',
        icon: 'error'
      });
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellNF: false, cellText: false });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws, { dateNF: 'yyyy-MM-dd', header: 0, raw: false });

      this.data.forEach(event => {
        this.datas.push([event.發布標題, event.內容概要, event.發布單位, event.開始日期, event.結束日期]);
      });

      if (this.datas.length === 0) {
        Swal.fire({
          text: '請輸入正確格式',
          icon: 'error'
        });
      } else {
        this.permissionCalendars.forEach(calendar => {
          if (this.data[0].發布單位 !== calendar.name) {
            count++;
          }
        });

        if (count === permissionCalendarsCount) {
          Swal.fire({
            text: '您沒有變更該行事曆的權限',
            icon: 'error'
          }).then((result) => {
            if (result.value) {
              window.location.reload();
            }
          });
        } else if (count !== permissionCalendarsCount) {
          this.selectedValue = this.data[0].發布單位;
        }
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  addCalendar() {
    if (localStorage.getItem('staff') === 'true') {
      this.router.navigate(['/add-calendar']);
    } else {
      this.router.navigate(['/add-calendar-unstaff']);
    }
  }


}
