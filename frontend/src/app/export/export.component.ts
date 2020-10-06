import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import * as jsPDF from 'jspdf';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { ShareDataService } from '../services/share-data.service';
import { CalendarService } from '../services/calendar.service';
import { SubscriptionService } from '../services/subscription.service';
import * as html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
//declare var jsPDF: any;

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})

export class ExportComponent implements OnInit {

  user = true;
  official = !this.user;
  searchText = '';
  put;
  title;
  calendars = [];
  myCalendars = [];
  mySub = [];
  data = {
    current: '1'
  };
  isCollapsed = false;
  showModal: boolean;
  events = [];
  event; eventTitle; eventStart; eventEnd; eventDesc; eventOffice;
  calendarName = [];
  doc;

  constructor(
    private router: Router,
    private eventService: EventService,
    private shareDataService: ShareDataService,
    private calendarService: CalendarService,
    private subscriptionService: SubscriptionService,
  ) { }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];

  eventTypes = [];

  hiddenCalendarEvents: Event[] = [];

  eventClick(info) {
    this.showModal = true; // Show-Hide Modal

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      if (String(this.events[i].id) === String(info.event.id)) {
        this.event = this.events[i];
        this.eventTitle = this.events[i].title;
        this.eventStart = this.events[i].startDate + ' ' + this.events[i].sTime;
        // this.eventEnd = this.events[i].endDate + ' ' + this.events[i].eTime;
        this.eventDesc = this.events[i].description;
        // this.eventOffice = this.events[i].calendars;
      }
    }

  }

  displayType(eventType: any): void {

    eventType.selected = !eventType.selected;
    const calendarEvents = this.calendarEvents.slice(); // a clone

    if (eventType.selected === true) {
      const calendarEventsToShow: any[] = [];

      // Show
      this.hiddenCalendarEvents
        .filter(calendarEvent => calendarEvent.calendars.includes(eventType.id))
        .forEach(calendarEvent => {
          calendarEvents.push(JSON.parse(JSON.stringify(calendarEvent)));
          calendarEventsToShow.push(calendarEvent.id);
        });


      calendarEventsToShow.forEach(calendarEventToShow => {
        const index = this.hiddenCalendarEvents.findIndex(hiddenCalendarEvent => hiddenCalendarEvent.id === calendarEventToShow);
        this.hiddenCalendarEvents.splice(index, 1);
      });

    } else {
      const calendarEventsToHide: any[] = [];

      // Hide
      calendarEvents
        .filter(calendarEvent => {
          if (calendarEvent.calendars.length === 1) {
            return calendarEvent.calendars.includes(eventType.id);
          } else if (calendarEvent.calendars.length > 1) {
            let count = 0;
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < calendarEvent.calendars.length; i++) {
              // tslint:disable-next-line: prefer-for-of
              for (let j = 0; j < this.eventTypes.length; j++) {
                if (calendarEvent.calendars[i] === this.eventTypes[j].id && this.eventTypes[j].selected === false) {
                  count++;
                  if (count === calendarEvent.calendars.length) {
                    return true;
                  }
                }
              }
            }
          }
        })
        .forEach(calendarEvent => {
          if (this.calendarComponent.getApi().getEventById(String(calendarEvent.id))) {
            this.calendarComponent
              .getApi()
              .getEventById(String(calendarEvent.id))
              .remove();
          }

          this.hiddenCalendarEvents.push(JSON.parse(JSON.stringify(calendarEvent)));
          calendarEventsToHide.push(calendarEvent.id);
        });

      calendarEventsToHide.forEach(calendarEventToHide => {
        const index = calendarEvents.findIndex(calendarEvent => calendarEvent.id === calendarEventToHide);
        calendarEvents.splice(index, 1);
      });
    }
    this.calendarEvents = calendarEvents; // reassign the array
  }

  ngOnInit(): void {
    // 
    // this.calendarService.getCalendar().subscribe(
    //   result => {
    //     // tslint:disable-next-line: prefer-for-of
    //     for (let j = 0; j < result.length; j++) {
    //       this.myCalendars.push({ id: result[j].id, name: result[j].name });
    //     }
    //   }
    // );

    // this.subscriptionService.getSubscription().subscribe(
    //   data => {
    //     // tslint:disable-next-line: prefer-for-of
    //     for (let i = 0; i < data.length; i++) {
    //       this.mySub.push({ id: data[i].id, name: data[i].name, calendar: data[i].calendar });
    //       this.eventTypes.push({ title: 'type' + data[i].calendar, id: data[i].calendar, selected: true });
    //     }
    //   }
    // );

    // this.eventService.getEvents().subscribe(
    //   data => {
    //     // tslint:disable-next-line: prefer-for-of
    //     for (let i = 0; i < data.length; i++) {

    //       this.events.push({
    //         id: data[i].id, title: data[i].title, start: data[i].startAt, calendars: data[i].calendars,
    //         end: data[i].endAt, name: data[i].calendars, startDate: data[i].startAt.substr(0, 10),
    //         endDate: data[i].endAt.substr(0, 10), description: data[i].description,
    //         sTime: data[i].startAt.substring(11, 16), eTime: data[i].endAt.substring(11, 16)
    //       });

    //     }

    //     // tslint:disable-next-line: only-arrow-functions
    //     this.events.sort(function (a, b) {
    //       const startA = a.start.toUpperCase(); // ignore upper and lowercase
    //       const startB = b.start.toUpperCase(); // ignore upper and lowercase
    //       if (startA < startB) {
    //         return -1;
    //       }
    //       if (startA > startB) {
    //         return 1;
    //       }

    //       // names must be equal
    //       return 0;
    //     });

    //     console.log(this.events);

    //     this.calendarEvents = this.events;

    //   }
    // );

    //   this.doc = new jsPDF('l', 'pt', 'a4');
    //   this.doc.setFont('jf');


    //   // horizontal line
    //   this.doc.setLineWidth(3);
    //   this.doc.line(20, 80, 250, 80);
    //   this.doc.line(20, 530, 250, 530);

    //   this.doc.setLineWidth(1);
    //   this.doc.line(20, 100, 250, 100);
    //   this.doc.line(260, 100, 820, 100);
    //   this.doc.line(20, 171.6, 87, 171.6);
    //   this.doc.line(20, 243.2, 87, 243.2);
    //   this.doc.line(20, 314.8, 87, 314.8);
    //   this.doc.line(20, 386.4, 87, 386.4);
    //   this.doc.line(20, 458, 87, 458);
    //   this.doc.line(87, 114.32, 250, 114.32);
    //   this.doc.line(87, 128.64, 250, 128.64);
    //   this.doc.line(87, 142.96, 250, 142.96);
    //   this.doc.line(87, 157.28, 250, 157.28);
    //   this.doc.line(87, 185.92, 250, 185.92);
    //   this.doc.line(87, 200.24, 250, 200.24);
    //   this.doc.line(87, 214.56, 250, 214.56);
    //   this.doc.line(87, 228.88, 250, 228.88);
    //   this.doc.line(87, 257.52, 250, 257.52);
    //   this.doc.line(87, 271.84, 250, 271.84);
    //   this.doc.line(87, 286.16, 250, 286.16);
    //   this.doc.line(87, 300.48, 250, 300.48);
    //   this.doc.line(87, 329.12, 250, 329.12);
    //   this.doc.line(87, 343.44, 250, 343.44);
    //   this.doc.line(87, 357.76, 250, 357.76);
    //   this.doc.line(87, 372.08, 250, 372.08);
    //   this.doc.line(87, 400.72, 250, 400.72);
    //   this.doc.line(87, 415.04, 250, 415.04);
    //   this.doc.line(87, 429.36, 250, 429.36);
    //   this.doc.line(87, 443.68, 250, 443.68);
    //   this.doc.line(87, 472.32, 250, 472.32);
    //   this.doc.line(87, 486.64, 250, 486.64);
    //   this.doc.line(87, 500.96, 250, 500.96);
    //   this.doc.line(87, 515.28, 250, 515.28);

    //   this.doc.setLineWidth(3);
    //   this.doc.line(260, 80, 820, 80);
    //   this.doc.line(260, 530, 820, 530);

    //   this.doc.setLineWidth(2);
    //   this.doc.line(87, 171.6, 250, 171.6);
    //   this.doc.line(87, 243.2, 250, 243.2);
    //   this.doc.line(87, 314.8, 250, 314.8);
    //   this.doc.line(87, 386.4, 250, 386.4);
    //   this.doc.line(87, 458, 250, 458);
    //   this.doc.line(260, 171.6, 820, 171.6);
    //   this.doc.line(260, 243.2, 820, 243.2);
    //   this.doc.line(260, 314.8, 820, 314.8);
    //   this.doc.line(260, 386.4, 820, 386.4);
    //   this.doc.line(260, 458, 820, 458);

    //   // vertical line
    //   this.doc.setLineWidth(3);
    //   this.doc.line(20, 78.5, 20, 531.5);
    //   this.doc.line(87, 78.5, 87, 530);
    //   this.doc.line(250, 78.5, 250, 531.5);
    //   this.doc.line(260, 78.5, 260, 531.5);
    //   this.doc.line(820, 78.5, 820, 531.5);

    //   this.doc.setLineWidth(1);
    //   this.doc.line(40, 100, 40, 530);
    //   this.doc.line(110, 78.5, 110, 530);
    //   this.doc.line(135, 78.5, 135, 530);
    //   this.doc.line(160, 78.5, 160, 530);
    //   this.doc.line(184, 78.5, 184, 530);
    //   this.doc.line(208, 78.5, 208, 530);
    //   this.doc.line(230, 78.5, 230, 530);
    //   this.doc.setLineWidth(2);
    //   this.doc.line(550, 78.5, 550, 530);

    //   // text
    //   this.doc.setFontSize(19);
    //   this.doc.text('國 立 臺 北 商 業 大 學 108 學 年 度 第 1 學 期 行 事 曆', 230, 70);

    //   this.doc.setFontSize(14);
    //   this.doc.text('日', 91, 96);
    //   this.doc.text('一', 115, 96);
    //   this.doc.text('二', 140, 96);
    //   this.doc.text('三', 165, 96);
    //   this.doc.text('四', 189, 96);
    //   this.doc.text('五', 211, 96);
    //   this.doc.text('六', 232, 96);
    //   this.doc.text('日間學制行事摘要', 350, 96);
    //   this.doc.text('進修學制行事摘要', 630, 96);

    //   this.doc.addPage();


    //   // horizontal line
    //   this.doc.setLineWidth(3);
    //   this.doc.line(20, 80, 250, 80);
    //   this.doc.line(20, 530, 250, 530);

    //   this.doc.setLineWidth(1);
    //   this.doc.line(20, 100, 250, 100);
    //   this.doc.line(260, 100, 820, 100);
    //   this.doc.line(20, 171.6, 87, 171.6);
    //   this.doc.line(20, 243.2, 87, 243.2);
    //   this.doc.line(20, 314.8, 87, 314.8);
    //   this.doc.line(20, 386.4, 87, 386.4);
    //   this.doc.line(20, 458, 87, 458);
    //   this.doc.line(87, 114.32, 250, 114.32);
    //   this.doc.line(87, 128.64, 250, 128.64);
    //   this.doc.line(87, 142.96, 250, 142.96);
    //   this.doc.line(87, 157.28, 250, 157.28);
    //   this.doc.line(87, 185.92, 250, 185.92);
    //   this.doc.line(87, 200.24, 250, 200.24);
    //   this.doc.line(87, 214.56, 250, 214.56);
    //   this.doc.line(87, 228.88, 250, 228.88);
    //   this.doc.line(87, 257.52, 250, 257.52);
    //   this.doc.line(87, 271.84, 250, 271.84);
    //   this.doc.line(87, 286.16, 250, 286.16);
    //   this.doc.line(87, 300.48, 250, 300.48);
    //   this.doc.line(87, 329.12, 250, 329.12);
    //   this.doc.line(87, 343.44, 250, 343.44);
    //   this.doc.line(87, 357.76, 250, 357.76);
    //   this.doc.line(87, 372.08, 250, 372.08);
    //   this.doc.line(87, 400.72, 250, 400.72);
    //   this.doc.line(87, 415.04, 250, 415.04);
    //   this.doc.line(87, 429.36, 250, 429.36);
    //   this.doc.line(87, 443.68, 250, 443.68);
    //   this.doc.line(87, 472.32, 250, 472.32);
    //   this.doc.line(87, 486.64, 250, 486.64);
    //   this.doc.line(87, 500.96, 250, 500.96);
    //   this.doc.line(87, 515.28, 250, 515.28);

    //   this.doc.setLineWidth(3);
    //   this.doc.line(260, 80, 820, 80);
    //   this.doc.line(260, 530, 820, 530);

    //   this.doc.setLineWidth(2);
    //   this.doc.line(87, 171.6, 250, 171.6);
    //   this.doc.line(87, 243.2, 250, 243.2);
    //   this.doc.line(87, 314.8, 250, 314.8);
    //   this.doc.line(87, 386.4, 250, 386.4);
    //   this.doc.line(87, 458, 250, 458);
    //   this.doc.line(260, 171.6, 820, 171.6);
    //   this.doc.line(260, 243.2, 820, 243.2);
    //   this.doc.line(260, 314.8, 820, 314.8);
    //   this.doc.line(260, 386.4, 820, 386.4);
    //   this.doc.line(260, 458, 820, 458);

    //   // vertical line
    //   this.doc.setLineWidth(3);
    //   this.doc.line(20, 78.5, 20, 531.5);
    //   this.doc.line(87, 78.5, 87, 530);
    //   this.doc.line(250, 78.5, 250, 531.5);
    //   this.doc.line(260, 78.5, 260, 531.5);
    //   this.doc.line(820, 78.5, 820, 531.5);

    //   this.doc.setLineWidth(1);
    //   this.doc.line(40, 100, 40, 530);
    //   this.doc.line(110, 78.5, 110, 530);
    //   this.doc.line(135, 78.5, 135, 530);
    //   this.doc.line(160, 78.5, 160, 530);
    //   this.doc.line(184, 78.5, 184, 530);
    //   this.doc.line(208, 78.5, 208, 530);
    //   this.doc.line(230, 78.5, 230, 530);
    //   this.doc.setLineWidth(2);
    //   this.doc.line(550, 78.5, 550, 530);

    //   // text
    //   this.doc.setFontSize(19);
    //   this.doc.text('國 立 臺 北 商 業 大 學 108 學 年 度 第 2 學 期 行 事 曆  ', 230, 70);

    //   this.doc.setFontSize(14);
    //   this.doc.text('日', 91, 96);
    //   this.doc.text('一', 115, 96);
    //   this.doc.text('二', 140, 96);
    //   this.doc.text('三', 165, 96);
    //   this.doc.text('四', 189, 96);
    //   this.doc.text('五', 211, 96);
    //   this.doc.text('六', 232, 96);
    //   this.doc.text('日間學制行事摘要', 350, 96);
    //   this.doc.text('進修學制行事摘要', 630, 96);
  }

  savePdf() {
    // const doc = new jsPDF('l', 'pt', 'a4')
    // const section = this.downloadpdf.nativeElement;
    // doc.setFont('jf');
    // const margins ={
    //   top: 20,
    //   bottom: 20,
    //   left: 20,
    //   right: 20,
    // };

    // console.log(doc);
    //   doc.fromHTML(section.innerHTML, margins.left, margins.top, {}, function(){
    //     doc.save('demo.pdf');       
    //   });

    html2canvas(this.screen.nativeElement).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      var docDefinition = {
        content: [{
          image: this.downloadLink.nativeElement.href,
          width: 500,

        }],
        pageSize: 'RA4',
        pageMargins: [20, 20, 20, 20]
      };
      pdfMake.createPdf(docDefinition).download('demo.pdf');
      //this.downloadLink.nativeElement.click();
    });
  }
}

