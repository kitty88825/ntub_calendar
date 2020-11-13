import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import * as jsPDF from 'jspdf';
import { FullCalendarComponent } from '@fullcalendar/angular';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})


export class ExportComponent implements OnInit {

  isCollapsed = false;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  ngOnInit(): void {

  }

  async savePdf() {
    for (var i = 0; i < 2; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          $('html,main').animate({ scrollTop: 0 });
          console.log('totheTop' + i);
          resolve();
        }, 500);
      });
    }
    html2canvas(this.screen.nativeElement).then(canvas => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;

      var pageHeight = contentWidth / 592.28 * 841.89;
      var leftHeight = contentHeight;
      var position = 10; 

      var imgWidth = 572.28;
      var imgHeight = 572.28 / contentWidth * contentHeight; //592
      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('1', 'pt', 'a4');
      
      

      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 10, 10, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 10, position, imgWidth, imgHeight)
          leftHeight -= pageHeight;
          position -= 900;
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save('demo.pdf');
    })
    console.log('success download PDF');
  }
}

