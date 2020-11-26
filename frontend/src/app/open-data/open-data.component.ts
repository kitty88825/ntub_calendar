import { CalendarService } from './../services/calendar.service';
import { EventService } from './../services/event.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss']
})
export class OpenDataComponent implements OnInit {
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  showDatas = [];
  header = ['起始日期', '結束日期', '性質', '類別', '對象', '說明'];
  exportTitle = ['學年度', '設立別', '學校類別', '學校代碼', '學校名稱', '學期', '起始日期', '結束日期', '性質', '類別', '對象', '說明']
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  year = [];
  setYear = 0;
  setTerm = 0;
  showModal: boolean;
  exportDatas = [];
  allEvents = [];
  staff = localStorage.getItem('staff');

  constructor(
    private eventService: EventService,
    private calendarService: CalendarService
  ) { }

  @ViewChild('ngxLoading', { static: false }) ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public coloursEnabled = false;
  public loadingTemplate: TemplateRef<any>;
  public config = {
    animationType: ngxLoadingAnimationTypes.none, primaryColour: this.primaryColour,
    secondaryColour: this.secondaryColour, tertiaryColour: this.primaryColour, backdropBorderRadius: '3px'
  };

  ngOnInit(): void {
    this.loading = !this.loading;
    this.eventService.getEvents_event().subscribe(
      data => {
        this.calendarService.getCalendar().subscribe(
          result => {
            data.forEach(event => {
              result.forEach(calendar => {
                if (event.eventinvitecalendarSet[0].mainCalendar.id === calendar.id && calendar.display === 'public') {
                  this.allEvents.push(event);
                  this.year.push(Number(event.startAt.substr(0, 4)) - 1911);
                }
              });
            });

            this.yearSort();

            this.setYear = Number(this.todayDate.substr(0, 4)) - 1911;
            if (Number(this.todayDate.substr(5, 2)) >= 7) {
              this.setTerm = 2;
            } else {
              this.setTerm = 1;
            }

            this.changeEvent();
            this.showDataSort();
            this.exportDataSort();
          }
        );
        this.loading = !this.loading;
      }
    );
  }

  daochu(info) {
    const output = [];
    output.push(this.exportTitle);
    this.exportDatas.forEach(data => {
      output.push(data);
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(output);
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

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, '台北商業大學.' + info.target.innerText);
  }

  change() {
    this.showDatas = [];
    this.exportDatas = [];
    this.changeEvent();
    this.showDataSort();
    this.exportDataSort();
  }

  showDataSort() {
    this.showDatas.sort((a, b) => {
      const A = a[0].toUpperCase();
      const B = b[0].toUpperCase();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
      return 0;
    });
  }

  exportDataSort() {
    this.exportDatas.sort((a, b) => {
      const A = a[6].toUpperCase();
      const B = b[6].toUpperCase();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
      return 0;
    });
  }

  yearSort() {
    this.year = this.year.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    this.year.sort((a, b) => {
      if (a < b) {
        return 1;
      }
      if (a > b) {
        return -1;
      }
      return 0;
    });
  }

  download() {
    this.showModal = true;
  }

  hideExcel() {
    this.showModal = false;
  }

  changeEvent() {
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
  }

  toggleColours(): void {
    this.coloursEnabled = !this.coloursEnabled;

    if (this.coloursEnabled) {
      this.primaryColour = PrimaryRed;
      this.secondaryColour = SecondaryBlue;
    } else {
      this.primaryColour = PrimaryWhite;
      this.secondaryColour = SecondaryGrey;
    }
  }

}
