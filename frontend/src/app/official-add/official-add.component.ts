import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {
  datas = [];
  selectedValue;
  years = [];
  result = [];
  showDatas = [];
  header = ['發布標題', '內容概要', '發布單位', '開始日期', '結束日期'];
  output = [];
  isCollapsed = false;
  subName = [];
  selectCalendar;
  calendarId = [];

  constructor(
    private eventService: EventService,
    private subscriptionService: SubscriptionService
  ) { }

  @ViewChild('table', { read: ElementRef }) table: ElementRef;


  ngOnInit(): void {
    this.eventService.getEvents().subscribe(
      // tslint:disable-next-line: no-shadowed-variable
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          if (Number(data[i].startAt.substr(5, 2)) < 8) {
            this.datas.push([data[i].title, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            this.years.push(Number(data[i].startAt.substr(0, 4)) - 1912);
          } else if (Number(data[i].endAt.substr(5, 2)) < 8) {
            this.datas.push([data[i].title, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            this.years.push(Number(data[i].endAt.substr(0, 4)) - 1912);
          } else if (Number(data[i].startAt.substr(5, 2)) < 8 && Number(data[i].endAt.substr(5, 2)) < 8) {
            this.datas.push([data[i].title, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            this.years.push(Number(data[i].startAt.substr(0, 4)) - 1912, Number(data[i].endAt.substr(0, 4)) - 1912);
          } else {
            this.datas.push([data[i].title, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            this.years.push(Number(data[i].startAt.substr(0, 4)) - 1911, Number(data[i].endAt.substr(0, 4)) - 1911);
          }
        }
        // tslint:disable-next-line: only-arrow-functions
        this.result = this.years.filter(function (element, index, arr) {
          return arr.indexOf(element) === index;
        });
        // tslint:disable-next-line: only-arrow-functions
        this.result.sort(function (a, b) {
          return b - a;
        });
      }
    );

    this.subscriptionService.getSubscription().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          this.subName.push(result[j].name);
        }
      }
    );

  }

  onChange() {
    this.showDatas = [];
    this.calendarId = [];
    this.subscriptionService.getSubscription().subscribe(
      result => {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < result.length; j++) {
          if (this.selectCalendar === result[j].name) {
            this.calendarId.push({ calendar: result[j].calendar, name: result[j].name });
            this.eventService.getEvents().subscribe(
              item => {
                // tslint:disable-next-line: prefer-for-of
                for (let k = 0; k < item.length; k++) {
                  if (this.calendarId[0].calendar === item[k].calendars[0]) {
                    this.showDatas.push([item[k].title, item[k].description, this.selectCalendar,
                       item[k].startAt.substr(0, 10), item[k].endAt.substr(0, 10)]);
                  }
                }
              }
            );
          }
        }
      }
    );
    this.eventService.getEvents().subscribe(
      // tslint:disable-next-line: no-shadowed-variable
      data => {
        if (this.selectCalendar || this.selectedValue) {
          console.log('yes');
        } else if (!this.selectCalendar) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < data.length; i++) {
            if (Number(data[i].startAt.substr(0, 4)) - 1911 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) > 7) {
              this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            } else if (Number(data[i].endAt.substr(0, 4)) - 1911 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) > 7) {
              this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            } else if (Number(data[i].startAt.substr(0, 4)) - 1912 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) < 8) {
              this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            } else if (Number(data[i].endAt.substr(0, 4)) - 1912 === this.selectedValue && Number(data[i].endAt.substr(5, 2)) < 8) {
              this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
            }
          }
        }
      }
    );
  }


  // 匯出
  daochu() {
    this.output.push(this.header);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.showDatas.length; i++) {
      this.output.push(this.showDatas[i]);
    }
    console.log(this.output);
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.output);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'demo.xlsx');
  }


}
