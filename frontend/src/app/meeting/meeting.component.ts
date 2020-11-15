import { TokenService } from './../services/token.service';
import { EventService } from './../services/event.service';
import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';

const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  myEmail = '';
  allMeet = [];
  allDate = [];
  myMeet = [];
  invitedMeet = [];
  pastMeet = [];
  isTrue = false;
  isOpen = false;
  edit = false;
  lookMeet = [];
  lookTitle; lookOffice; lookSTime;
  lookLocation; lookETime; lookDes;
  lookFiles = [];
  lookParticipants = [];
  staff = localStorage.getItem('staff');
  setStartDate = '';
  setEndDate = '';

  @ViewChild('addStartDate') start: ElementRef;
  @ViewChild('addEndDate') end: ElementRef;

  @ViewChild('ngxLoading', { static: false }) ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public coloursEnabled = false;
  public loadingTemplate: TemplateRef<any>;
  public config = {
    animationType: ngxLoadingAnimationTypes.none, primaryColour: this.primaryColour,
    secondaryColour: this.secondaryColour, tertiaryColour: this.primaryColour, backdropBorderRadius: '3px'
  };

  constructor(
    private eventService: EventService,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;
    this.tokenService.getUser().subscribe(
      data => {
        this.myEmail = data.email;
      }
    );

    this.eventService.getEvents_meet().subscribe(
      data => {
        data.forEach(meet => {
          this.allMeet.push(meet);
          this.allDate.push(meet.startAt.substr(0, 10));
          this.allDate.push(meet.endAt.substr(0, 10));
        });

        this.allDateSort();

        this.setStartDate = this.allDate[0];
        this.setEndDate = this.allDate[this.allDate.length - 1];

        this.allMeet.forEach(event => {
          event.eventparticipantSet.forEach(participant => {
            if (event.endAt.substr(0, 10).toUpperCase() >= this.todayDate.toUpperCase()) {
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
            } else if (event.endAt.substr(0, 10).toUpperCase() < this.todayDate.toUpperCase()) {
              if (participant.user === this.myEmail && participant.role === 'participants' || participant.role === 'editors') {
                this.pastMeet.push({
                  id: event.id, title: event.title, startDate: event.startAt.substr(0, 10),
                  sTime: event.startAt.substr(11, 5)
                });
              }
            }
          });

          this.myMeetSort();
          this.invitedMeetSort();
          this.pastMeetSort();
        });
        this.loading = !this.loading;
      }
    );

    if (this.myMeet.length === 0 && this.invitedMeet.length === 0 && this.pastMeet.length === 0) {
      Swal.fire({
        text: '目前尚無任何會議',
        icon: 'warning'
      });
    }
  }

  changeDate() {
    if (this.end.nativeElement.value < this.start.nativeElement.value) {
      Swal.fire({
        text: '請輸入正確時間',
        icon: 'error'
      });
    } else {
      this.loading = !this.loading;
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
      this.loading = !this.loading;

      if (this.myMeet.length === 0 && this.invitedMeet.length === 0 && this.pastMeet.length === 0) {
        Swal.fire({
          text: '查無會議',
          icon: 'warning'
        });
      }
    }
  }

  allDateSort() {
    this.allDate = this.allDate.filter((el, i, arr) => {
      return arr.indexOf(el) === i;
    });

    this.allDate.sort((a, b) => {
      const startA = a.toUpperCase();
      const startB = b.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

  allMeetSort() {
    this.allMeet.sort((a, b) => {
      const startA = a.startAt.toUpperCase();
      const startB = b.startAt.toUpperCase();
      if (startA < startB) {
        return -1;
      }
      if (startA > startB) {
        return 1;
      }
      return 0;
    });
  }

  myMeetSort() {
    this.myMeet.sort((a, b) => {
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

  invitedMeetSort() {
    this.invitedMeet.sort((a, b) => {
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

  pastMeetSort() {
    this.pastMeet.sort((a, b) => {
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

  toggleColours(): void {
    this.coloursEnabled = !this.coloursEnabled;

    if (this.coloursEnabled) {
      this.primaryColour = PrimaryRed;
      this.secondaryColour = SecondaryBlue;
    } else {
      this.primaryColour = PrimaryWhite;
      this.secondaryColour = SecondaryGrey;
    }
  }

}
