import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss']
})
export class OpenDataComponent implements OnInit {
  isCollapsed = false;
  showDatas = [];
  header = ['發布日期', '結束日期', '性質', '類別', '對象', '說明'];

  constructor() { }

  ngOnInit(): void {
  }

}
