import { Component, OnInit, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { EventService } from '../services/event.service';
import { DatePipe } from '@angular/common';
import { CalendarService } from '../services/calendar.service';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';
import { ViewChild } from '@angular/core';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

type AOA = any[];

@Component({
  selector: 'app-official-change',
  templateUrl: './official-change.component.html',
  styleUrls: ['./official-change.component.scss'],
  providers: [DatePipe]
})

export class OfficialChangeComponent implements OnInit {
  data: AOA;
  formData = { data: [], calendar: 0 };
  datas = [];
  header = ['發布標題', '內容概要', '開始日期', '結束日期'];
  istrue = 0;
  selectedValue = '';
  group = [];
  role = '';
  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  permissionCalendars = [];
  permission = '';
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

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
    private router: Router,
    private eventService: EventService,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;

    this.calendarService.getCalendarPermission().subscribe(
      data => {
        data.forEach(calendar => {
          this.permissionCalendars.push({ id: calendar.id, name: calendar.name, color: calendar.color });
        })

        if(this.permissionCalendars.length !== 0) {
          this.permission = 'true';
        }
        this.loading = !this.loading;
      }, error => {
        this.loading = !this.loading;
        Swal.fire({
          text: '獲取資料失敗',
          icon: 'error'
        });
      }
    )
  }

  add() {
    this.dataTrue();

    if (this.selectedValue.length !== 0) {
      if (this.istrue === this.datas.length && this.datas.length !== 0) {
        this.loading = !this.loading;
        this.datas.forEach(event => {
          if (event[1] === undefined) {
            this.formData.data.push({
              title: event[0], start_at: event[2] + 'T00:00:00+08:00', end_at: event[3] + 'T00:00:00+08:00',
              nature: 'event'
            });
          } else {
            this.formData.data.push({
              title: event[0], description: event[1], start_at: event[2] + 'T00:00:00+08:00', end_at: event[3] + 'T00:00:00+08:00',
              nature: 'event'
            });
          }
          this.permissionCalendars.forEach(calendar => {
            if (calendar.name === this.selectedValue) {
              this.formData.calendar = calendar.id;
            }
          });
        });
        this.eventService.postEventMany(this.formData).subscribe(
          data => {
            this.loading = !this.loading;

            if (this.loading === false) {
              Swal.fire({
                text: '新增成功',
                icon: 'success',
              }).then((result) => {
                this.router.navigate(['/calendar']);
              });
            }
          }, error => {
            console.log(error);
            this.loading = !this.loading;
            Swal.fire({
              text: '新增失敗',
              icon: 'error'
            }).then((res) => { window.location.reload() });
          }
        );

      } else {
        this.loading = !this.loading;
        Swal.fire({
          text: '新增失敗',
          icon: 'error'
        });
      }
    } else {
      Swal.fire({
        text: '請選擇匯入行事曆',
        icon: 'warning'
      });
    }

  }

  dataTrue() {
    this.istrue = 0;
    this.datas.forEach(event => {
      if (event[0] === undefined || event[2] === undefined || event[3] === undefined) {
        Swal.fire({
          text: '請輸入正確資料',
          icon: 'error',
        }).then((result) => {
          if (result.value === true) {
            Swal.fire({
              text: '是否前往使用教學查看正確格式?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#aaa',
              confirmButtonText: '確定',
              cancelButtonText: '取消'
            }).then((res) => {
              if (res.value === true) {
                this.router.navigate(['/user-teach']);
              } else {
                window.location.reload();
              }
            });
          }
        });
      } else {
        if (typeof event[0] === 'string' && event[2].length === 10 &&
          event[3].length === 10 && event[3].toUpperCase() >= event[2].toUpperCase()) {
          this.istrue = this.istrue + 1;
        } else {
          Swal.fire({
            text: '請輸入正確資料',
            icon: 'error',
          }).then((result) => {
            if (result.value === true) {
              Swal.fire({
                text: '是否前往使用教學查看正確格式?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#aaa',
                confirmButtonText: '確定',
                cancelButtonText: '取消'
              }).then((res) => {
                if (res.value === true) {
                  this.router.navigate(['/user-teach']);
                } else {
                  window.location.reload();
                }
              });
            }
          });
        }
      }
    });
  }

  onFileChange(evt: any) {
    this.data = [];
    this.datas = [];

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
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellNF: false, cellText: false });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws, { dateNF: 'yyyy-MM-dd', header: 0, raw: false });

      this.data.forEach(event => {
        this.datas.push([event.發布標題, event.內容概要, event.開始日期, event.結束日期]);
      });

      this.dataTrue();
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
