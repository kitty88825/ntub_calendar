import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {
  data = [
    ['2020-01-11', '放假']
  ];

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }


  // 匯出
  daochu() {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);
    const ws2: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.utils.book_append_sheet(wb, ws2, 'Sheet2');

    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, 'SheetJS.xlsx');
  }


}
