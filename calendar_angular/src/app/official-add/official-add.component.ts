import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';

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
  header = ['發布標題', '內容概要', '開始日期', '結束日期'];
  output = [];
  isCollapsed = false;

  constructor(
    private eventService: EventService,
  ) { }

  @ViewChild('table', { read: ElementRef }) table: ElementRef;


  ngOnInit(): void {
    this.eventService.getEvents().subscribe(
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
  }

  onChange() {
    this.showDatas = [];
    this.eventService.getEvents().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          if (Number(data[i].startAt.substr(0, 4)) - 1911 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) > 7) {
            this.showDatas.push([data[i].title,  data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
          } else if (Number(data[i].endAt.substr(0, 4)) - 1911 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) > 7) {
            this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
          } else if (Number(data[i].startAt.substr(0, 4)) - 1912 === this.selectedValue && Number(data[i].startAt.substr(5, 2)) < 8) {
            this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
          } else if (Number(data[i].endAt.substr(0, 4)) - 1912 === this.selectedValue && Number(data[i].endAt.substr(5, 2)) < 8) {
            this.showDatas.push([data[i].title, data[i].description, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
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
