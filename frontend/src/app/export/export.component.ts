import { EventService } from './../services/event.service';
import { CalendarService } from './../services/calendar.service';
import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { FullCalendarComponent } from '@fullcalendar/angular';

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
  showEventOne = [];
  showEventTwo = [];
  year = [];
  staff = localStorage.getItem('staff');
  setYear = new Date().getFullYear() - 1911;
  showTitle = false;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private calendarService: CalendarService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.year.push(this.setYear);
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
            calendars: event.eventinvitecalendarSet, startMonth: event.startAt.substr(5, 2), startDay: event.startAt.substr(8, 2),
            mainCalendar: event.eventinvitecalendarSet[0].mainCalendar.name
          });
        });

        this.allEvents.forEach(event => {
          this.year.push(Number(event.startDate.substr(0, 4)) - 1911);
        });

        this.yearSort();

      }
    );

  }

  yearSort() {
    this.year = this.year.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    this.year.sort((a, b) => {
      if (a < b) {
        return 1;
      }
      if (a > b) {
        return -1;
      }
      return 0;
    });
  }

  async savePdf(main: HTMLElement) {
    for (let i = 0; i < 2; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          main.scrollIntoView();
          resolve();
        }, 500);
      });
    }
    html2canvas(this.screen.nativeElement).then(canvas => {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      const pageHeight = contentWidth / 592.28 * 841.89;
      let leftHeight = contentHeight;
      let position = 0;

      const imgWidth = 595.28;
      const imgHeight = 592.28 / contentWidth * contentHeight;
      const pageData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('', 'pt', 'a4');

      if (leftHeight <= pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
          leftHeight -= pageHeight;
          position -= 851;
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save('demo.pdf');
    });
  }

  changeSelect() {
    this.resetDate();
    this.showEventSort();
  }

  changeYear() {
    this.resetDate();
    this.showEventSort();
  }

  resetDate() {
    this.showTitle = true;
    this.showEventOne = [];
    this.showEventTwo = [];
    const showEventOne = [];
    let calendarName = '';
    const showEventTwo = [];

    this.openCalendar.forEach(calendar => {
      this.allEvents.forEach(event => {
        if (calendar.isChecked === true && calendar.id === event.calendars[0].mainCalendar.id &&
          Number(this.setYear) === Number(event.startDate.substr(0, 4) - 1911)) {
          calendarName = event.mainCalendar;

          if (event.startDate.substr(5, 2) <= 7) {
            showEventOne.push(event);
          } else if (event.startDate.substr(5, 2) > 7) {
            showEventTwo.push(event);
          }
        }
      });
    });
    this.showEventOne.push({ calendar: calendarName, events: showEventOne });
    this.showEventTwo.push({ calendar: calendarName, events: showEventTwo });

    this.showEventSort();
  }

  showEventSort() {
    this.showEventOne[0].events.sort((a, b) => {
      const startA = a.startDate.toUpperCase();
      const startB = b.startDate.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });

    this.showEventTwo[0].events.sort((a, b) => {
      const startA = a.startDate.toUpperCase();
      const startB = b.startDate.toUpperCase();
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
