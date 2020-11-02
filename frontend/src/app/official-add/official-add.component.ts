import { CalendarService } from './../services/calendar.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {
  showDatas = [];
  header = ['發布標題', '內容概要', '發布單位', '開始日期', '結束日期'];
  output = [];
  isCollapsed = false;
  selectCalendar = '';
  calendarId = [];
  outputCalendar = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  startDate = this.todayDate;
  endDate = this.todayDate;

  constructor(
    private eventService: EventService,
    private calendarService: CalendarService
  ) { }

  @ViewChild('addStartDate') addStartDate: ElementRef;
  @ViewChild('addEndDate') addEndDate: ElementRef;


  ngOnInit(): void {

    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.outputCalendar.push(calendar);
        });
        this.selectCalendar = this.outputCalendar[0].name;
      }
    );

  }

  onChange() {
    this.showDatas = [];
    this.calendarId = [];
  }


  // 匯出
  daochu() {
    this.output.push(this.header);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.showDatas.length; i++) {
      this.output.push(this.showDatas[i]);
    }
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.output);

    const wscols = [
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];
    ws['!cols'] = wscols;

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'demo.xlsx');
  }

  changeDate() {
    this.showDatas = [];
    this.endDate = formatDate(this.endDate, 'yyyy-MM-dd', 'en');
    this.startDate = formatDate(this.startDate, 'yyyy-MM-dd', 'en')
    if (this.endDate.toUpperCase() >= this.startDate.toUpperCase()) {
      this.eventService.getEvents().subscribe(
        data => {
          data.forEach(event => {
            this.outputCalendar.forEach(calendar => {
              if (event.main_calendar_id === calendar.id) {
                if (calendar.name === this.selectCalendar &&
                  this.addStartDate.nativeElement.value.toUpperCase() <= event.startAt.substr(0, 10).toUpperCase() &&
                  this.addEndDate.nativeElement.value.toUpperCase() >= event.endAt.substr(0, 10).toUpperCase()) {
                  this.showDatas.push([event.title, event.description, calendar.name,
                  event.startAt.substr(0, 10), event.endAt.substr(0, 10)]);
                }
              }
            });
          });

          if (this.showDatas.length === 0) {
            Swal.fire({
              text: '沒有符合的資料',
              icon: 'warning',
            });
          }

          // tslint:disable-next-line: only-arrow-functions
          this.showDatas.sort(function (a, b) {
            const startA = a[3].toUpperCase(); // ignore upper and lowercase
            const startB = b[3].toUpperCase(); // ignore upper and lowercase
            if (startA < startB) {
              return -1;
            }
            if (startA > startB) {
              return 1;
            }
            return 0;
          });
        }
      );
    } else {
      Swal.fire({
        text: '請輸入正確時間',
        icon: 'error'
      });
    }
  }


}
