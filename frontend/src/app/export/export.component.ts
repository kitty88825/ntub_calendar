import { EventService } from './../services/event.service';
import { CalendarService } from './../services/calendar.service';
import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})

export class ExportComponent implements OnInit {

  isCollapsed = false;
  isTrue = false;
  isOpen = false;
  openCalendar = [];
  allEvents = [];
  showEvent = [];
  staff = localStorage.getItem('staff');

  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private calendarService: CalendarService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.openCalendar.push({
            id: calendar.id, name: calendar.name, display: calendar.display,
            color: calendar.color, isChecked: false
          });
        });
      }
    );

    this.eventService.getEvents().subscribe(
      data => {
        data.forEach(event => {
          this.allEvents.push({
            id: event.id, title: event.title, description: event.description, startDate: event.startAt.substr(0, 10),
            calendars: event.eventinvitecalendarSet
          });
        });
      }
    );
  }

  savePdf() {
    html2canvas(this.screen.nativeElement).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      const docDefinition = {
        content: [{
          image: this.downloadLink.nativeElement.href,
          width: 550
        }],
        pageSize: 'A4',
        pageMargins: [20, 0, 20, 0]
      };
      pdfMake.createPdf(docDefinition).download('demo.pdf');
    });
  }

  changeSelect() {
    this.showEvent = [];

    this.openCalendar.forEach(calendar => {
      this.allEvents.forEach(event => {
        if (calendar.isChecked === true && calendar.id === event.calendars[0].mainCalendar.id) {
          this.showEvent.push(event);
        }
      });
    });


    // tslint:disable-next-line: only-arrow-functions
    this.showEvent.sort(function (a, b) {
      const startA = a.startDate.toUpperCase(); // ignore upper and lowercase
      const startB = b.startDate.toUpperCase(); // ignore upper and lowercase
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }
}
