import { EventService } from './../services/event.service';
import { CalendarService } from './../services/calendar.service';
import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { FullCalendarComponent } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/daygrid';

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
  year = [];
  staff = localStorage.getItem('staff');
  setYear = new Date().getFullYear() - 1911;
  showTitle = false;

  eventMonth_1 = [];
  eventMonth_2 = [];
  eventMonth_3 = [];
  eventMonth_4 = [];
  eventMonth_5 = [];
  eventMonth_6 = [];
  eventMonth_7 = [];
  eventMonth_8 = [];
  eventMonth_9 = [];
  eventMonth_10 = [];
  eventMonth_11 = [];
  eventMonth_12 = [];

  eventMonth_1_nd = [];
  eventMonth_2_nd = [];
  eventMonth_3_nd = [];
  eventMonth_4_nd = [];
  eventMonth_5_nd = [];
  eventMonth_6_nd = [];
  eventMonth_7_nd = [];
  eventMonth_8_nd = [];
  eventMonth_9_nd = [];
  eventMonth_10_nd = [];
  eventMonth_11_nd = [];
  eventMonth_12_nd = [];

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private calendarService: CalendarService,
    private eventService: EventService
  ) { }

  calendarPlugins = [dayGridPlugin];
  setDate8 = '2020-08-01';
  setDate9 = '2020-09-01';
  setDate10 = '2020-10-01';
  setDate11 = '2020-11-01';
  setDate12 = '2020-12-01';
  setDate1 = '2020-01-01';

  setDate2 = '2020-02-01';
  setDate3 = '2020-03-01';
  setDate4 = '2020-04-01';
  setDate5 = '2020-05-01';
  setDate6 = '2020-06-01';
  setDate7 = '2020-07-01';

  ngOnInit(): void {
    this.year.push(this.setYear);
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(calendar => {
          this.openCalendar.push({
            id: calendar.id, name: calendar.name, display: calendar.display,
            color: calendar.color //isChecked: false
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

  // changeSelect(){
  //   this.resetDate();
  //   this.showEventSort();
  // }

  changeYear() {
    this.resetDate();
    this.showEventSort();
  }

  resetDate() {
    this.showTitle = true;

    this.eventMonth_1 = [];
    this.eventMonth_2 = [];
    this.eventMonth_3 = [];
    this.eventMonth_4 = [];
    this.eventMonth_5 = [];
    this.eventMonth_6 = [];
    this.eventMonth_7 = [];
    this.eventMonth_8 = [];
    this.eventMonth_9 = [];
    this.eventMonth_10 = [];
    this.eventMonth_11 = [];
    this.eventMonth_12 = [];

    const eventMonth_1 = [];
    const eventMonth_2 = [];
    const eventMonth_3 = [];
    const eventMonth_4 = [];
    const eventMonth_5 = [];
    const eventMonth_6 = [];
    const eventMonth_7 = [];
    const eventMonth_8 = [];
    const eventMonth_9 = [];
    const eventMonth_10 = [];
    const eventMonth_11 = [];
    const eventMonth_12 = [];

    this.eventMonth_1_nd = [];
    this.eventMonth_2_nd = [];
    this.eventMonth_3_nd = [];
    this.eventMonth_4_nd = [];
    this.eventMonth_5_nd = [];
    this.eventMonth_6_nd = [];
    this.eventMonth_7_nd = [];
    this.eventMonth_8_nd = [];
    this.eventMonth_9_nd = [];
    this.eventMonth_10_nd = [];
    this.eventMonth_11_nd = [];
    this.eventMonth_12_nd = [];

    const eventMonth_1_nd = [];
    const eventMonth_2_nd = [];
    const eventMonth_3_nd = [];
    const eventMonth_4_nd = [];
    const eventMonth_5_nd = [];
    const eventMonth_6_nd = [];
    const eventMonth_7_nd = [];
    const eventMonth_8_nd = [];
    const eventMonth_9_nd = [];
    const eventMonth_10_nd = [];
    const eventMonth_11_nd = [];
    const eventMonth_12_nd = [];

    this.openCalendar.forEach(calendar => {
      this.allEvents.forEach(event => {
        if (calendar.id === event.calendars[0].mainCalendar.id &&
          Number(this.setYear) === Number(event.startDate.substr(0, 4) - 1911) &&
          calendar.name === '日間部行事曆') {
          // if內 calendar.isChecked === true
          if (event.startDate.substr(5, 2) <= 7 && event.startDate.substr(5, 2) > 1) {
            switch (event.startDate.substr(5, 2)) {
              case '02':
                eventMonth_2.push(event);
                break;
              case '03':
                eventMonth_3.push(event);
                break;
              case '04':
                eventMonth_4.push(event);
                break;
              case '05':
                eventMonth_5.push(event);
                break;
              case '06':
                eventMonth_6.push(event);
                break;
              case '07':
                eventMonth_7.push(event);
                break;
            }
            return 0;
          } else if (event.startDate.substr(5, 2) > 7) {
            switch (event.startDate.substr(5, 2)) {
              case '08':
                eventMonth_8.push(event);
                break;
              case '09':
                eventMonth_9.push(event);
                break;
              case '10':
                eventMonth_10.push(event);
                break;
              case '11':
                eventMonth_11.push(event);
                break;
              case '12':
                eventMonth_12.push(event);
                break;
            }
            return 0;
          } else if (event.startDate.substr(5, 2) < 2) {
            switch (event.startDate.substr(5, 2)) {
              case '01':
                eventMonth_1.push(event);
                break;
            }
            return 0;
          }
        } else if (calendar.id === event.calendars[0].mainCalendar.id &&
          Number(this.setYear) === Number(event.startDate.substr(0, 4) - 1911) &&
          calendar.name === '進修部行事曆') {
          if (event.startDate.substr(5, 2) <= 7 && event.startDate.substr(5, 2) > 1) {
            switch (event.startDate.substr(5, 2)) {
              case '02':
                eventMonth_2_nd.push(event);
                break;
              case '03':
                eventMonth_3_nd.push(event);
                break;
              case '04':
                eventMonth_4_nd.push(event);
                break;
              case '05':
                eventMonth_5_nd.push(event);
                break;
              case '06':
                eventMonth_6_nd.push(event);
                break;
              case '07':
                eventMonth_7_nd.push(event);
                break;
            }
            return 0;
          } else if (event.startDate.substr(5, 2) > 7) {
            switch (event.startDate.substr(5, 2)) {
              case '08':
                eventMonth_8_nd.push(event);
                break;
              case '09':
                eventMonth_9_nd.push(event);
                break;
              case '10':
                eventMonth_10_nd.push(event);
                break;
              case '11':
                eventMonth_11_nd.push(event);
                break;
              case '12':
                eventMonth_12_nd.push(event);
                break;
            }
            return 0;
          } else if (event.startDate.substr(5, 2) < 2) {
            switch (event.startDate.substr(5, 2)) {
              case '01':
                eventMonth_1_nd.push(event);
                break;
            }
            return 0;
          }
        }
      });
    });
    this.eventMonth_1.push({ events: eventMonth_1 });
    this.eventMonth_2.push({ events: eventMonth_2 });
    this.eventMonth_3.push({ events: eventMonth_3 });
    this.eventMonth_4.push({ events: eventMonth_4 });
    this.eventMonth_5.push({ events: eventMonth_5 });
    this.eventMonth_6.push({ events: eventMonth_6 });
    this.eventMonth_7.push({ events: eventMonth_7 });
    this.eventMonth_8.push({ events: eventMonth_8 });
    this.eventMonth_9.push({ events: eventMonth_9 });
    this.eventMonth_10.push({ events: eventMonth_10 });
    this.eventMonth_11.push({ events: eventMonth_11 });
    this.eventMonth_12.push({ events: eventMonth_12 });

    this.eventMonth_1_nd.push({ events: eventMonth_1_nd });
    this.eventMonth_2_nd.push({ events: eventMonth_2_nd });
    this.eventMonth_3_nd.push({ events: eventMonth_3_nd });
    this.eventMonth_4_nd.push({ events: eventMonth_4_nd });
    this.eventMonth_5_nd.push({ events: eventMonth_5_nd });
    this.eventMonth_6_nd.push({ events: eventMonth_6_nd });
    this.eventMonth_7_nd.push({ events: eventMonth_7_nd });
    this.eventMonth_8_nd.push({ events: eventMonth_8_nd });
    this.eventMonth_9_nd.push({ events: eventMonth_9_nd });
    this.eventMonth_10_nd.push({ events: eventMonth_10_nd });
    this.eventMonth_11_nd.push({ events: eventMonth_11_nd });
    this.eventMonth_12_nd.push({ events: eventMonth_12_nd });

    this.showEventSort();
  }

  showEventSort() {
    // 日間部
    this.eventMonth_1[0].events.sort((a, b) => {
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
    this.eventMonth_2[0].events.sort((a, b) => {
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
    this.eventMonth_3[0].events.sort((a, b) => {
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
    this.eventMonth_4[0].events.sort((a, b) => {
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
    this.eventMonth_5[0].events.sort((a, b) => {
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
    this.eventMonth_6[0].events.sort((a, b) => {
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
    this.eventMonth_7[0].events.sort((a, b) => {
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
    this.eventMonth_8[0].events.sort((a, b) => {
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
    this.eventMonth_9[0].events.sort((a, b) => {
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
    this.eventMonth_10[0].events.sort((a, b) => {
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
    this.eventMonth_11[0].events.sort((a, b) => {
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
    this.eventMonth_12[0].events.sort((a, b) => {
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

    // 進修部
    this.eventMonth_1_nd[0].events.sort((a, b) => {
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
    this.eventMonth_2_nd[0].events.sort((a, b) => {
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
    this.eventMonth_3_nd[0].events.sort((a, b) => {
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
    this.eventMonth_4_nd[0].events.sort((a, b) => {
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
    this.eventMonth_5_nd[0].events.sort((a, b) => {
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
    this.eventMonth_6_nd[0].events.sort((a, b) => {
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
    this.eventMonth_7_nd[0].events.sort((a, b) => {
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
    this.eventMonth_8_nd[0].events.sort((a, b) => {
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
    this.eventMonth_9_nd[0].events.sort((a, b) => {
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
    this.eventMonth_10_nd[0].events.sort((a, b) => {
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
    this.eventMonth_11_nd[0].events.sort((a, b) => {
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
    this.eventMonth_12_nd[0].events.sort((a, b) => {
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
