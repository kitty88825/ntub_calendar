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

  @ViewChild('content') content: ElementRef;
  SavePDF() {
    let content = this.content.nativeElement;
    let doc = new jsPDF();
    let _elementHandlers =
    {
      '#editor': function (element, renderer) {
        return true;
      }
    };
    doc.fromHTML(content.innerHTML, 15, 15, {

      'width': 190,
      'elementHandlers': _elementHandlers
    });

    doc.save('test.pdf');
  }


}


