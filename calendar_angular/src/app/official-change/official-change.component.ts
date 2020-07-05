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
  fileName: '';
  data: AOA;
  formData = new FormData();
  calendars = '';
  datas = [];
  header = ['發布標題', '內容概要', '開始日期', '結束日期'];
  input = [];
  istrue = 0;
  selectedValue;
  result = [];
  calendar = [];
  isCollapsed = false;

  // tslint:disable-next-line: member-ordering
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor(
    private router: Router,
    private eventService: EventService,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.result.push(data[i].name);
          this.calendar.push([data[i].id, data[i].name]);
        }
      }
    );
  }

  add() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.datas.length; i++) {
      if (typeof this.datas[i][0] === 'string' && this.datas[i][1].length === 10 &&
        this.datas[i][2].length === 10 && this.selectedValue.length !== 0) {
        this.istrue = this.istrue + 1;
      } else {
        Swal.fire({
          text: '請輸入正確資料',
          icon: 'error'
        }).then(this.datas.length = 0);
      }
    }

    if (this.istrue === this.datas.length) {
      this.calendarService.getCalendar().subscribe(
        data => {
          console.log(data);
        }
      );

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.datas.length; i++) {
        this.formData.append('title', this.datas[i][0]);
        this.formData.append('description', this.datas[i][1]);
        this.formData.append('start_at', this.datas[i][2] + 'T00:00:00+08:00');
        this.formData.append('end_at', this.datas[i][3] + 'T00:00:00+08:00');
        this.eventService.postEvent(this.formData).subscribe(
          data => {
            console.log(data);
          },
          error => {
            console.log(error);
          }
        );
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
      }
    }

  }

  onChange() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.calendar.length; i++) {
      if (this.selectedValue === this.calendar[i][1]) {
        this.formData.append('calendars', this.calendar[i][0]);
      }
    }
  }

  onFileChange(evt: any) {
    this.data = [];
    this.datas = [];
    /* wire up file reader */
    const target: DataTransfer = (evt.target) as DataTransfer;
    if (target.files.length !== 1) {
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
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.data.length; i++) {
        this.datas.push([this.data[i].發布標題, this.data[i].內容概要, this.data[i].開始日期, this.data[i].結束日期]);
      }

      if (this.datas.length === 0) {
        Swal.fire({
          text: '請輸入正確格式',
          icon: 'error'
        });
      }

    };
    reader.readAsBinaryString(target.files[0]);
  }


}
