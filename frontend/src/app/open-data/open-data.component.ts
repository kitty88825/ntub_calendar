import { EventService } from './../services/event.service';
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss']
})
export class OpenDataComponent implements OnInit {
  isCollapsed = false;
  showDatas = [];
  header = ['起始日期', '結束日期', '性質', '類別', '對象', '說明'];
  exportTitle = ['學年度', '設立別', '學校類別', '學校代碼', '學校名稱', '學期', '起始日期', '結束日期', '性質', '類別', '對象', '說明']
  output = [];
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  year = [];
  setYear = 0;
  setTerm = 0;
  showModal: boolean;
  exportDatas = [];
  allEvents = [];

  constructor(
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.eventService.getEvents().subscribe(
      data => {
        data.forEach(event => {
          this.allEvents.push(event);
          this.year.push(Number(event.startAt.substr(0, 4)) - 1911);
        });

        this.year = this.year.filter(function (el, i, arr) {
          return arr.indexOf(el) === i;
        });

        // tslint:disable-next-line: only-arrow-functions
        this.year.sort(function (a, b) {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }

          // names must be equal
          return 0;
        });

        this.setYear = Number(this.todayDate.substr(0, 4)) - 1911;
        if (Number(this.todayDate.substr(6, 2)) >= 7) {
          this.setTerm = 1;
        } else {
          this.setTerm = 2;
        }

        data.forEach(event => {
          if (Number(event.startAt.substr(0, 4)) - 1911 === this.setYear) {
            if (this.setTerm === 1) {
              if (Number(event.startAt.substr(5, 2)) < 7) {
                this.showDatas.push([event.startAt.substr(0, 10), event.endAt.substr(0, 10), '', '', '', event.title]);
                this.exportDatas.push([this.setYear, '公立', '技專院校', '0051', '國立台北商業大學', 1, event.startAt.substr(0, 10),
                event.endAt.substr(0, 10), '', '', '', event.title]);
              }
            } else if (this.setTerm === 2) {
              if (Number(event.startAt.substr(5, 2)) >= 7) {
                this.showDatas.push([event.startAt.substr(0, 10), event.endAt.substr(0, 10), '', '', '', event.title]);
                this.exportDatas.push([this.setYear, '公立', '技專院校', '0051', '國立台北商業大學', 2, event.startAt.substr(0, 10),
                event.endAt.substr(0, 10), '', '', '', event.title]);
              }
            }
          }
        });

        // tslint:disable-next-line: only-arrow-functions
        this.showDatas.sort(function (a, b) {
          const A = a[0].toUpperCase();
          const B = b[0].toUpperCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }

          // names must be equal
          return 0;
        });


        // tslint:disable-next-line: only-arrow-functions
        this.exportDatas.sort(function (a, b) {
          const A = a[6].toUpperCase();
          const B = b[6].toUpperCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }

          // names must be equal
          return 0;
        });

      }
    );
  }

  // 匯出
  daochu(info) {
    this.output = [];
    this.output.push(this.exportTitle);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.exportDatas.length; i++) {
      this.output.push(this.exportDatas[i]);
    }
    /* generate worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.output);
    const wscols = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 100 },
    ];
    ws['!cols'] = wscols;

    /* generate workbook and add the worksheet */
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'demo.' + info.target.innerText);
  }

  change() {
    this.showDatas = [];
    this.exportDatas = [];
    this.allEvents.forEach(event => {
      if (Number(event.startAt.substr(0, 4)) - 1911 === Number(this.setYear)) {
        if (Number(this.setTerm) === 1) {
          if (Number(event.startAt.substr(5, 2)) < 7) {
            this.showDatas.push([event.startAt.substr(0, 10), event.endAt.substr(0, 10), '', '', '', event.title]);
            this.exportDatas.push([this.setYear, '公立', '技專院校', '0051', '國立台北商業大學', 1, event.startAt.substr(0, 10),
            event.endAt.substr(0, 10), '', '', '', event.title]);
          }
        } else if (Number(this.setTerm) === 2) {
          if (Number(event.startAt.substr(5, 2)) >= 7) {
            this.showDatas.push([event.startAt.substr(0, 10), event.endAt.substr(0, 10), '', '', '', event.title]);
            this.exportDatas.push([this.setYear, '公立', '技專院校', '0051', '國立台北商業大學', 2, event.startAt.substr(0, 10),
            event.endAt.substr(0, 10), '', '', '', event.title]);
          }
        }
      }
    });
    // tslint:disable-next-line: only-arrow-functions
    this.showDatas.sort(function (a, b) {
      const A = a[0].toUpperCase();
      const B = b[0].toUpperCase();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }

      // names must be equal
      return 0;
    });


    // tslint:disable-next-line: only-arrow-functions
    this.exportDatas.sort(function (a, b) {
      const A = a[6].toUpperCase();
      const B = b[6].toUpperCase();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }

      // names must be equal
      return 0;
    });

  }

  download() {
    this.showModal = true;
  }

  hideExcel() {
    this.showModal = false;
  }

}
