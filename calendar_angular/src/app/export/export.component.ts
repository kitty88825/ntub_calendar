import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as jsPDF from 'jspdf';


@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  user = false;
  official = !this.user;

  constructor() { }

  ngOnInit(): void {
  }

  savePdf() {
    const doc = new jsPDF();
    console.log(doc.getFontList());
    doc.setFont('jf');
    
    // horizontal line
    doc.setFontSize(22)
    doc.text('國立臺北商業大學',70,8)

    doc.setLineWidth(1)
    doc.line(10, 13, 200, 13) // horizontal line

    doc.setLineWidth(0.5)
    doc.line(10, 23, 200, 23) 

    doc.setLineWidth(0.5)
    doc.line(10, 63, 200, 63) 

    doc.setLineWidth(0.5)
    doc.line(10, 103, 200, 103) 

    doc.setLineWidth(0.5)
    doc.line(10, 143, 200, 143) 

    doc.setLineWidth(0.5)
    doc.line(10, 183, 200, 183) 

    doc.setLineWidth(0.5)
    doc.line(10, 223, 200, 223) 

    doc.setLineWidth(1)
    doc.line(10, 283, 200, 283) 

    // vertical line
    doc.setLineWidth(1)
    doc.line(10, 13, 10, 283) 

    doc.setLineWidth(0.5)
    doc.line(75, 13, 75, 283)

    doc.setLineWidth(1)
    doc.line(200, 13, 200, 283) 

    //text
    doc.setFontSize(16)
    doc.text('日期',37,20)
    doc.text('行程',130,20)

    doc.addPage()

    doc.save('demo.pdf');
  }
}


