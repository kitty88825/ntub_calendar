import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CalendarService } from '../services/calendar.service';

type AOA = any[];

@Component({
  selector: 'app-official-change',
  templateUrl: './official-change.component.html',
  styleUrls: ['./official-change.component.scss']
})
export class OfficialChangeComponent implements OnInit {
  fileName: '';
  data: AOA;
  formData = new FormData();
  calendars = '';

  // tslint:disable-next-line: member-ordering
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor(
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void { }

  add() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.data.length; i++) {
      this.formData.append('title', this.data[i][0]);
      this.formData.append('start_at', this.data[i][1] + 'T00:00:00+08:00');
      this.formData.append('end_at', this.data[i][2] + 'T00:00:00+08:00');
      this.formData.append('calendars', [this.calendars].toString());
      this.calendarService.postEvent(this.formData).subscribe(
        data => {
          console.log(data);
          Swal.fire({
            text: '新增成功',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: '回首頁',
            cancelButtonText: '留在此頁',
          }).then((result) => {
            if (result.value) {
              this.router.navigate(['/calendar']);
            }
          });
        },
        error => {
          console.log(error);
          Swal.fire({
            text: '新增失敗',
            icon: 'error'
          });
        }
      );

    }

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
      console.log(this.data);
    };
    reader.readAsBinaryString(target.files[0]);
  }


}
