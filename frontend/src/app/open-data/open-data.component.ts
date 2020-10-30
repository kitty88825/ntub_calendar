import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss']
})
export class OpenDataComponent implements OnInit {
  isCollapsed = false;
  showDatas = [];
  header = ['發布日期', '結束日期', '性質', '類別', '對象', '說明'];
  output = [];

  constructor() { }

  ngOnInit(): void {
  }

  // 匯出
  daochu(info) {
    this.output = [];
    this.output.push(this.header);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.showDatas.length; i++) {
      this.output.push(this.showDatas[i]);
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

}
