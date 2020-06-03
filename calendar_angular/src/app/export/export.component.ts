import { Component, OnInit } from '@angular/core';
import * as jsPDF from 'jspdf';



@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})

export class ExportComponent implements OnInit {

  doc;

  ngOnInit(): void {
    this.doc = new jsPDF('l', 'pt', 'a4');
    this.doc.setFont('jf');

    // horizontal line
    this.doc.setLineWidth(3);
    this.doc.line(20, 80, 250, 80);
    this.doc.line(20, 530, 250, 530);

    this.doc.setLineWidth(1);
    this.doc.line(20, 100, 250, 100);
    this.doc.line(260, 100, 820, 100);
    this.doc.line(20, 171.6, 87, 171.6);
    this.doc.line(20, 243.2, 87, 243.2);
    this.doc.line(20, 314.8, 87, 314.8);
    this.doc.line(20, 386.4, 87, 386.4);
    this.doc.line(20, 458, 87, 458);
    this.doc.line(87, 114.32, 250, 114.32);
    this.doc.line(87, 128.64, 250, 128.64);
    this.doc.line(87, 142.96, 250, 142.96);
    this.doc.line(87, 157.28, 250, 157.28);
    this.doc.line(87, 185.92, 250, 185.92);
    this.doc.line(87, 200.24, 250, 200.24);
    this.doc.line(87, 214.56, 250, 214.56);
    this.doc.line(87, 228.88, 250, 228.88);
    this.doc.line(87, 257.52, 250, 257.52);
    this.doc.line(87, 271.84, 250, 271.84);
    this.doc.line(87, 286.16, 250, 286.16);
    this.doc.line(87, 300.48, 250, 300.48);
    this.doc.line(87, 329.12, 250, 329.12);
    this.doc.line(87, 343.44, 250, 343.44);
    this.doc.line(87, 357.76, 250, 357.76);
    this.doc.line(87, 372.08, 250, 372.08);
    this.doc.line(87, 400.72, 250, 400.72);
    this.doc.line(87, 415.04, 250, 415.04);
    this.doc.line(87, 429.36, 250, 429.36);
    this.doc.line(87, 443.68, 250, 443.68);
    this.doc.line(87, 472.32, 250, 472.32);
    this.doc.line(87, 486.64, 250, 486.64);
    this.doc.line(87, 500.96, 250, 500.96);
    this.doc.line(87, 515.28, 250, 515.28);

    this.doc.setLineWidth(3);
    this.doc.line(260, 80, 820, 80);
    this.doc.line(260, 530, 820, 530);

    this.doc.setLineWidth(2);
    this.doc.line(87, 171.6, 250, 171.6);
    this.doc.line(87, 243.2, 250, 243.2);
    this.doc.line(87, 314.8, 250, 314.8);
    this.doc.line(87, 386.4, 250, 386.4);
    this.doc.line(87, 458, 250, 458);
    this.doc.line(260, 171.6, 820, 171.6);
    this.doc.line(260, 243.2, 820, 243.2);
    this.doc.line(260, 314.8, 820, 314.8);
    this.doc.line(260, 386.4, 820, 386.4);
    this.doc.line(260, 458, 820, 458);

    // vertical line
    this.doc.setLineWidth(3);
    this.doc.line(20, 78.5, 20, 531.5);
    this.doc.line(87, 78.5, 87, 530);
    this.doc.line(250, 78.5, 250, 531.5);
    this.doc.line(260, 78.5, 260, 531.5);
    this.doc.line(820, 78.5, 820, 531.5);

    this.doc.setLineWidth(1);
    this.doc.line(40, 100, 40, 530);
    this.doc.line(110, 78.5, 110, 530);
    this.doc.line(135, 78.5, 135, 530);
    this.doc.line(160, 78.5, 160, 530);
    this.doc.line(184, 78.5, 184, 530);
    this.doc.line(208, 78.5, 208, 530);
    this.doc.line(230, 78.5, 230, 530);
    this.doc.setLineWidth(2);
    this.doc.line(550, 78.5, 550, 530);

    // text
    this.doc.setFontSize(19);
    this.doc.text('國 立 臺 北 商 業 大 學 108 學 年 度 第 1 學 期 行 事 曆', 230, 70);

    this.doc.setFontSize(14);
    this.doc.text('日', 91, 96);
    this.doc.text('一', 115, 96);
    this.doc.text('二', 140, 96);
    this.doc.text('三', 165, 96);
    this.doc.text('四', 189, 96);
    this.doc.text('五', 211, 96);
    this.doc.text('六', 232, 96);
    this.doc.text('日間學制行事摘要', 350, 96);
    this.doc.text('進修學制行事摘要', 630, 96);

    this.doc.addPage();


    // horizontal line
    this.doc.setLineWidth(3);
    this.doc.line(20, 80, 250, 80);
    this.doc.line(20, 530, 250, 530);

    this.doc.setLineWidth(1);
    this.doc.line(20, 100, 250, 100);
    this.doc.line(260, 100, 820, 100);
    this.doc.line(20, 171.6, 87, 171.6);
    this.doc.line(20, 243.2, 87, 243.2);
    this.doc.line(20, 314.8, 87, 314.8);
    this.doc.line(20, 386.4, 87, 386.4);
    this.doc.line(20, 458, 87, 458);
    this.doc.line(87, 114.32, 250, 114.32);
    this.doc.line(87, 128.64, 250, 128.64);
    this.doc.line(87, 142.96, 250, 142.96);
    this.doc.line(87, 157.28, 250, 157.28);
    this.doc.line(87, 185.92, 250, 185.92);
    this.doc.line(87, 200.24, 250, 200.24);
    this.doc.line(87, 214.56, 250, 214.56);
    this.doc.line(87, 228.88, 250, 228.88);
    this.doc.line(87, 257.52, 250, 257.52);
    this.doc.line(87, 271.84, 250, 271.84);
    this.doc.line(87, 286.16, 250, 286.16);
    this.doc.line(87, 300.48, 250, 300.48);
    this.doc.line(87, 329.12, 250, 329.12);
    this.doc.line(87, 343.44, 250, 343.44);
    this.doc.line(87, 357.76, 250, 357.76);
    this.doc.line(87, 372.08, 250, 372.08);
    this.doc.line(87, 400.72, 250, 400.72);
    this.doc.line(87, 415.04, 250, 415.04);
    this.doc.line(87, 429.36, 250, 429.36);
    this.doc.line(87, 443.68, 250, 443.68);
    this.doc.line(87, 472.32, 250, 472.32);
    this.doc.line(87, 486.64, 250, 486.64);
    this.doc.line(87, 500.96, 250, 500.96);
    this.doc.line(87, 515.28, 250, 515.28);

    this.doc.setLineWidth(3);
    this.doc.line(260, 80, 820, 80);
    this.doc.line(260, 530, 820, 530);

    this.doc.setLineWidth(2);
    this.doc.line(87, 171.6, 250, 171.6);
    this.doc.line(87, 243.2, 250, 243.2);
    this.doc.line(87, 314.8, 250, 314.8);
    this.doc.line(87, 386.4, 250, 386.4);
    this.doc.line(87, 458, 250, 458);
    this.doc.line(260, 171.6, 820, 171.6);
    this.doc.line(260, 243.2, 820, 243.2);
    this.doc.line(260, 314.8, 820, 314.8);
    this.doc.line(260, 386.4, 820, 386.4);
    this.doc.line(260, 458, 820, 458);

    // vertical line
    this.doc.setLineWidth(3);
    this.doc.line(20, 78.5, 20, 531.5);
    this.doc.line(87, 78.5, 87, 530);
    this.doc.line(250, 78.5, 250, 531.5);
    this.doc.line(260, 78.5, 260, 531.5);
    this.doc.line(820, 78.5, 820, 531.5);

    this.doc.setLineWidth(1);
    this.doc.line(40, 100, 40, 530);
    this.doc.line(110, 78.5, 110, 530);
    this.doc.line(135, 78.5, 135, 530);
    this.doc.line(160, 78.5, 160, 530);
    this.doc.line(184, 78.5, 184, 530);
    this.doc.line(208, 78.5, 208, 530);
    this.doc.line(230, 78.5, 230, 530);
    this.doc.setLineWidth(2);
    this.doc.line(550, 78.5, 550, 530);

    // text
    this.doc.setFontSize(19);
    this.doc.text('國 立 臺 北 商 業 大 學 108 學 年 度 第 2 學 期 行 事 曆  ', 230, 70);

    this.doc.setFontSize(14);
    this.doc.text('日', 91, 96);
    this.doc.text('一', 115, 96);
    this.doc.text('二', 140, 96);
    this.doc.text('三', 165, 96);
    this.doc.text('四', 189, 96);
    this.doc.text('五', 211, 96);
    this.doc.text('六', 232, 96);
    this.doc.text('日間學制行事摘要', 350, 96);
    this.doc.text('進修學制行事摘要', 630, 96);
    console.log(this.doc);
  }


  savePdf() {
    this.doc.save('demo.pdf');
  }
}

