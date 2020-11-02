import { EventService } from './../services/event.service';
import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  startDate = this.todayDate;
  endDate = this.todayDate;

  constructor(
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.eventService.getEvents_meet().subscribe(
      data => {
        console.log(data);
      }
    );
  }

}
