import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

type AOA = any[];

@Component({
  selector: 'app-official-change',
  templateUrl: './official-change.component.html',
  styleUrls: ['./official-change.component.scss']
})
export class OfficialChangeComponent implements OnInit {
  fileName: '';
  data: AOA;
  // tslint:disable-next-line: member-ordering
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void { }

  add() {
    Swal.fire({
      text: '新增成功',
      icon: 'success'
    });
    this.router.navigate(['/calendar']);
  }

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = (evt.target) as DataTransfer;
    if (target.files.length !== 1) { throw new Error('Cannot use multiple files'); }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = (XLSX.utils.sheet_to_json(ws, { header: 1 })) as AOA;
      console.log();
    };
    reader.readAsBinaryString(target.files[0]);
  }


}
