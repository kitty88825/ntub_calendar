import { formatDate } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Pipe } from '@angular/core';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  setStartYear = Number(this.todayDate.substring(0, 4));
  Year = [];
  setStartMonth = Number(this.todayDate.substr(5, 2));
  Month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  setStartDay = Number(this.todayDate.substr(8, 2));
  startDay = [];
  bigMonth = [1, 3, 5, 7, 8, 10, 12];
  smallMonth = [4, 6, 9, 11];
  setEndYear = 0;
  setEndMonth = 0;
  setEndDay = 0;
  endDay = [];

  constructor() { }

  ngOnInit(): void {
    let preStartYear = this.setStartYear;
    let nextStartYear = this.setStartYear;

    this.Year.push(this.setStartYear);
    for (let i = 0; i < 3; i++) {
      preStartYear = preStartYear - 1;
      this.Year.push(preStartYear);
    }
    for (let i = 0; i < 3; i++) {
      nextStartYear = nextStartYear + 1;
      this.Year.push(nextStartYear);
    }

    // tslint:disable-next-line: only-arrow-functions
    this.Year.sort(function (a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }

      // names must be equal
      return 0;
    });

    if (this.setStartMonth !== 12) {
      this.setEndYear = this.setStartYear;
      this.setEndMonth = this.setStartMonth + 1;
    } else if (this.setStartMonth === 12) {
      this.setEndYear = this.setStartYear + 1;
      this.setEndMonth = 1;
    }

    this.bigMonth.forEach(month => {
      if (month === this.setStartMonth) {
        let count = 1;
        for (let i = 0; i < 31; i++) {
          this.startDay.push(count);
          count++;
        }
      } else if (this.smallMonth.includes(this.setStartMonth)) {
        let count = 1;
        for (let i = 0; i < 30; i++) {
          this.startDay.push(count);
          count++;
        }
      } else if (month === this.setEndMonth) {
        let count = 1;
        for (let i = 0; i < 31; i++) {
          this.endDay.push(count);
          count++;
        }
      } else if (this.smallMonth.includes(this.setEndMonth)) {
        this.endDay = [];
        let count = 1;
        for (let i = 0; i < 30; i++) {
          this.endDay.push(count);
          count++;
        }
      } else if (Number(this.setStartMonth) === 2 && (this.setStartYear - 2020) % 4 === 0) {
        let count = 1;
        for (let i = 0; i < 29; i++) {
          this.startDay.push(count);
          count++;
        }
      } else if (Number(this.setStartMonth) === 2 && (this.setStartYear - 2020) % 4 !== 0) {
        let count = 1;
        for (let i = 0; i < 28; i++) {
          this.startDay.push(count);
          count++;
        }
      } else if (Number(this.setEndMonth) === 2 && (this.setEndYear - 2020) % 4 === 0) {
        let count = 1;
        for (let i = 0; i < 29; i++) {
          this.endDay.push(count);
          count++;
        }
      } else if (Number(this.setEndMonth) === 2 && (this.setEndYear - 2020) % 4 !== 0) {
        let count = 1;
        for (let i = 0; i < 28; i++) {
          this.endDay.push(count);
          count++;
        }
      }
    });

    if (this.endDay.includes(this.setStartDay) !== true) {
      if (this.setEndMonth === 2) {
        this.setEndDay = 28;
      } else {
        this.setEndDay = 30;
      }
    } else if (this.endDay.includes(this.setStartDay)) {
      this.setEndDay = this.setStartDay;
    }

  }

  changeStartYear() {
    this.changeStartMonth();
    if (this.setEndYear < this.setStartYear) {
      this.setEndYear = this.setStartYear;
    }
  }

  changeEndYear() {
    this.changeEndMonth();
    if (this.setEndYear < this.setStartYear) {
      this.setStartYear = this.setEndYear;
    }
  }

  changeStartMonth() {
    this.startDay = [];
    if (this.bigMonth.includes(Number(this.setStartMonth))) {
      let count = 1;
      for (let i = 0; i < 31; i++) {
        this.startDay.push(count);
        count++;
      }
    } else if (this.smallMonth.includes(Number(this.setStartMonth))) {
      let count = 1;
      for (let i = 0; i < 30; i++) {
        this.startDay.push(count);
        count++;
      }
    } else if (Number(this.setStartMonth) === 2 && (this.setStartYear - 2020) % 4 === 0) {
      let count = 1;
      for (let i = 0; i < 29; i++) {
        this.startDay.push(count);
        count++;
      }
    } else if (Number(this.setStartMonth) === 2 && (this.setStartYear - 2020) % 4 !== 0) {
      let count = 1;
      for (let i = 0; i < 28; i++) {
        this.startDay.push(count);
        count++;
      }
    }
  }

  changeEndMonth() {
    this.endDay = [];

    if (this.setStartYear === this.setEndYear && this.setEndMonth < this.setStartMonth) {
      this.setEndMonth = this.setStartMonth;
    }

    if (this.bigMonth.includes(Number(this.setEndMonth))) {
      let count = 1;
      for (let i = 0; i < 31; i++) {
        this.endDay.push(count);
        count++;
      }
    } else if (this.smallMonth.includes(Number(this.setEndMonth))) {
      let count = 1;
      for (let i = 0; i < 30; i++) {
        this.endDay.push(count);
        count++;
      }
    } else if (Number(this.setEndMonth) === 2 && (this.setEndYear - 2020) % 4 === 0) {
      let count = 1;
      for (let i = 0; i < 29; i++) {
        this.endDay.push(count);
        count++;
      }
    } else if (Number(this.setEndMonth) === 2 && (this.setEndYear - 2020) % 4 !== 0) {
      let count = 1;
      for (let i = 0; i < 28; i++) {
        this.endDay.push(count);
        count++;
      }
    }
  }

  changeStartDay() {
    if (this.setStartYear === this.setEndYear && this.setStartMonth === this.setEndMonth && Number(this.setEndDay) < this.setStartDay) {
      this.setStartDay = this.setEndDay;
    }
  }

  changeEndDay() {
    if (this.setStartYear === this.setEndYear && this.setStartMonth === this.setEndMonth && Number(this.setEndDay) < this.setStartDay) {
      this.setEndDay = this.setStartDay;
    }
  }

}
