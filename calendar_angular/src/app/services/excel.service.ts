import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as moment from 'moment';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
// Let's make some changes to this empty array

@Injectable()
export class ExcelService {
  constructor() { }
  mappedJson = [];
  public exportAsExcelFile(json: any[]): void {
    /****************
    * Let's make some changes in our data
    */
    this.mappedJson = json.map(item => {
      console.log(item);
      return {
        Eid: item.eid,
        Ename: item.ename,
        EDate: item.edate ? moment(item.edate).format('YYYY-MM-DD') : 'N/A'
      };
    });

  }

}
