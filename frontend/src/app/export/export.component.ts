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
        data.forEach(calendar => this.calendars.push({ id: calendar.id, name: calendar.name, isChecked: false }));
      }
    );
  }


  savePdf() {
  }
}

