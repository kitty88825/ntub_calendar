import { CalendarService } from './../services/calendar.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})

export class ExportComponent implements OnInit {
  isCollapsed;
  calendars = [];

  constructor(
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        // // tslint:disable-next-line: prefer-for-of
        // for (let i = 0; i < data.length; i++) {
        //   this.calendars.push({ id: data[i].id, name: data[i].name, isChecked: false })
        // }
      }
    );
  }

  savePdf() {
  }
}

