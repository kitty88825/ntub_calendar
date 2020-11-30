import { CalendarService } from './../services/calendar.service';
import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';
import { TokenService } from './../services/token.service';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {
  showDatas = [];
  header = ['發布標題', '內容概要', '開始日期', '結束日期'];
  isCollapsed = false;
  selectCalendar = '';
  calendarId = [];
  permissionCalendars = [];
  todayDate = new Date();
  startDate = this.todayDate;
  endDate = this.todayDate;
  isOpen = false;
  isTrue = false;
  permission = localStorage.getItem('permission');
  group = [];
  role = '';

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

  constructor(
    private eventService: EventService,
    private calendarService: CalendarService,
    private tokenService: TokenService
  ) { }

  @ViewChild('addStartDate') addStartDate: ElementRef;
  @ViewChild('addEndDate') addEndDate: ElementRef;


  ngOnInit(): void {
    this.loading = !this.loading;
    this.startDate.setMonth(this.startDate.getMonth() - 6);
    this.endDate = new Date();

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
        this.selectCalendar = this.permissionCalendars[0].name;
      },
      error => {
        Swal.fire({
          text: '獲取資料失敗',
          icon: 'error'
        });
      }
    );
    this.loading = !this.loading;
  }

  onChange() {
    this.showDatas = [];
    this.calendarId = [];
  }

  daochu() {
    const output = [];
    output.push(this.header);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.showDatas.length; i++) {
      output.push(this.showDatas[i]);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(output);

    const wscols = [
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.selectCalendar + '.xlsx');
  }

  changeDate() {
    this.loading = !this.loading;
    this.showDatas = [];

    if (this.endDate >= this.startDate) {
      this.eventService.getEvents().subscribe(
        data => {
          data.forEach(event => {
            this.permissionCalendars.forEach(calendar => {
              if (event.eventinvitecalendarSet[0].mainCalendar.id === calendar.id &&
                calendar.name === this.selectCalendar &&
                this.addStartDate.nativeElement.value.toUpperCase() <= event.startAt.substr(0, 10).toUpperCase() &&
                this.addEndDate.nativeElement.value.toUpperCase() >= event.endAt.substr(0, 10).toUpperCase()) {
                this.showDatas.push([event.title, event.description,
                event.startAt.substr(0, 10), event.endAt.substr(0, 10)]);
              }
            });
          });
          this.loading = !this.loading;

          if (this.showDatas.length === 0) {
            Swal.fire({
              text: '沒有符合的資料',
              icon: 'warning',
            });
          }

          this.showDatas.sort((a, b) => {
            const startA = a[2].toUpperCase();
            const startB = b[2].toUpperCase();
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
      this.loading = !this.loading;
      Swal.fire({
        text: '請輸入正確時間',
        icon: 'error'
      });
    }
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
