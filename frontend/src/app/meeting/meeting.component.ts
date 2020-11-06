import { Router } from '@angular/router';
import { TokenService } from './../services/token.service';
import { EventService } from './../services/event.service';
import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  startDate = this.todayDate;
  endDate = this.todayDate;
  myEmail = '';
  allMeet = [];
  myMeet = [];
  invitedMeet = [];
  pastMeet = [];
  edit = false;
  lookMeet = [];
  lookTitle; lookOffice; lookSTime;
  lookLocation; lookETime; lookDes;
  lookFiles = [];
  lookParticipants = [];

  @ViewChild('addStartDate') start: ElementRef;
  @ViewChild('addEndDate') end: ElementRef;

  constructor(
    private eventService: EventService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tokenService.getUser().subscribe(
      data => {
        this.myEmail = data.email;
      }
    );

    this.eventService.getEvents_meet().subscribe(
      data => {
        data.forEach(meet => {
          this.allMeet.push(meet);
        });

        this.allMeet.forEach(event => {
          event.eventparticipantSet.forEach(participant => {
            if (participant.user === this.myEmail && participant.role === 'editors') {
              this.myMeet.push({
                id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                sTime: event.startAt.substr(11, 5)
              });
            }
            if (participant.user === this.myEmail && participant.role === 'participants') {
              this.invitedMeet.push({
                id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                sTime: event.startAt.substr(11, 5)
              });
            }
            if (event.startAt.substr(0, 10).toUpperCase() < this.startDate.toUpperCase()) {
              if (participant.user === this.myEmail && participant.role === 'participants' || participant.role === 'editors') {
                this.pastMeet.push({
                  id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                  sTime: event.startAt.substr(11, 5)
                });
              }
            }
          });
        });

        this.myMeetSort();
        this.invitedMeetSort();
        this.pastMeetSort();
      }
    );

  }

  changeDate() {
    if (this.end.nativeElement.value < this.start.nativeElement.value) {
      Swal.fire({
        text: '請輸入正確時間',
        icon: 'error'
      });
    } else {
      this.invitedMeet = [];
      this.myMeet = [];
      this.pastMeet = [];

      this.allMeet.forEach(event => {
        event.eventparticipantSet.forEach(participant => {
          if (event.startAt.substr(0, 10).toUpperCase() >= this.start.nativeElement.value.toUpperCase() &&
            event.startAt.substr(0, 10).toUpperCase() <= this.end.nativeElement.value.toUpperCase()) {
            if (participant.user === this.myEmail && participant.role === 'editors') {
              this.myMeet.push({
                id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                sTime: event.startAt.substr(11, 5)
              });
            }
            if (participant.user === this.myEmail && participant.role === 'participants') {
              this.invitedMeet.push({
                id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                sTime: event.startAt.substr(11, 5)
              });
            }
          } else if (event.startAt.substr(0, 10).toUpperCase() < this.end.nativeElement.value.toUpperCase()) {
            if (participant.user === this.myEmail && participant.role === 'participants' || participant.role === 'editors') {
              this.pastMeet.push({
                id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                sTime: event.startAt.substr(11, 5)
              });
            }
          }
        });
      });

      this.myMeetSort();
      this.invitedMeetSort();
      this.pastMeetSort();
    }
  }

  myMeetSort() {
    // tslint:disable-next-line: only-arrow-functions
    this.myMeet.sort(function (a, b) {
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

  invitedMeetSort() {
    // tslint:disable-next-line: only-arrow-functions
    this.invitedMeet.sort(function (a, b) {
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

  pastMeetSort() {
    // tslint:disable-next-line: only-arrow-functions
    this.pastMeet.sort(function (a, b) {
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

  editMeet(id) {
    this.lookMeet = [];
    this.lookFiles = [];
    this.lookParticipants = [];
    this.edit = true;
    this.allMeet.forEach(event => {
      if (event.id === id) {
        this.lookMeet.push(event);
      }
    });

    this.lookTitle = this.lookMeet[0].title;
    this.lookOffice = this.lookMeet[0].eventinvitecalendarSet[0].mainCalendar.name;
    this.lookSTime = this.lookMeet[0].startAt.substr(0, 10) + ' ' + this.lookMeet[0].startAt.substr(11, 5);
    this.lookETime = this.lookMeet[0].endAt.substr(0, 10) + ' ' + this.lookMeet[0].endAt.substr(11, 5);
    this.lookLocation = this.lookMeet[0].location;
    this.lookDes = this.lookMeet[0].description;
    this.lookMeet[0].attachments.forEach(file => {
      this.lookFiles.push(file.filename);
    });
    this.lookMeet[0].eventparticipantSet.forEach(participant => {
      if (participant.user !== this.myEmail) {
        this.lookParticipants.push(participant);
      }
    });
  }

  goback() {
    this.edit = false;
  }

}
