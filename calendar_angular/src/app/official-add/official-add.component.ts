import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {
  datas = [];

  constructor(
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.getEvents().subscribe(
      data => {
        console.log(data);
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.datas.push([data[i].title, data[i].startAt.substr(0, 10), data[i].endAt.substr(0, 10)]);
        }
      }
    );
  }


  // 匯出
  daochu() {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.datas);
    const ws2: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.utils.book_append_sheet(wb, ws2, 'Sheet2');

    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, 'demo.xlsx');
  }


}
