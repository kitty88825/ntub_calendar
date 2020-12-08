import { CalendarService } from './../services/calendar.service';
import { Router } from '@angular/router';
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
  selector: 'app-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.scss']
})
export class MeetingDetailComponent implements OnInit {
  id;
  hasData: boolean;
  todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  myEmail = '';
  isTrue = false;
  isOpen = false;
  lookMeet = [];
  lookTitle; lookOffice; lookSTime; lookSDate; lookCalendarId;
  lookLocation; lookETime; lookDes; lookEDate; lookEventId;
  lookFiles = [];
  lookParticipants = [];
  permission = '';
  showEvent: boolean;
  data = { current: '0' };
  origin = '';
  formDate = {};
  role = '';
  noRes: boolean;
  group = [];


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
    private route: Router,
    private eventService: EventService,
    private tokenService: TokenService,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.loading = !this.loading;
    localStorage.removeItem('url');
    this.tokenService.getUser().subscribe(
      data => {
        this.myEmail = data.email;
        this.role = data.role;
        this.group = data.groups;
      }
    );
    this.id = Number(this.route.url.substr(9));
    this.calendarService.getCalendar().subscribe(
      data => {
        data.forEach(res => {
          res.permissions.forEach(permission => {
            if (this.group.includes(permission.group) && this.role === permission.role && permission.authority === 'write') {
              this.permission = 'true';
            }
          });
        });
      }
    );
    this.eventService.getEvents_meet().subscribe(
      data => {
        data.forEach(event => {
          if (event.id === this.id) {
            this.hasData = true;
            this.lookMeet.push(event);
          }
        });
        if (this.hasData === true) {
          this.lookEventId = this.lookMeet[0].id;
          this.lookTitle = this.lookMeet[0].title;
          this.lookCalendarId = this.lookMeet[0].eventinvitecalendarSet[0].mainCalendar.id;
          this.lookOffice = this.lookMeet[0].eventinvitecalendarSet[0].mainCalendar.name;
          this.lookSDate = this.lookMeet[0].startAt;
          this.lookEDate = this.lookMeet[0].endAt;
          this.lookSTime = this.lookMeet[0].startAt.substr(0, 10) + ' ' + this.lookMeet[0].startAt.substr(11, 5);
          this.lookETime = this.lookMeet[0].endAt.substr(0, 10) + ' ' + this.lookMeet[0].endAt.substr(11, 5);
          this.lookLocation = this.lookMeet[0].location;
          this.lookDes = this.lookMeet[0].description;
          this.lookMeet[0].attachments.forEach(file => {
            this.lookFiles.push({fileName: file.filename, fileLink: file.file});
          });
          this.lookMeet[0].eventparticipantSet.forEach(participant => {
            if (participant.role === 'editors') {
              this.lookParticipants.push({ user: participant.user, role: participant.role, response: 'creator' });
            } else {
              this.lookParticipants.push(participant);
            }
          });
          this.lookParticipants.forEach(par => {
            if (par.user === this.myEmail && par.response === 'no_reply' && this.lookEDate.substr(0, 10).toUpperCase() >= this.todayDate) {
              this.noRes = true;
            } else if (par.user === this.myEmail && par.response !== 'no_reply' && par.response !== 'creator' &&
              this.lookEDate.substr(0, 10).toUpperCase() >= this.todayDate) {
              this.noRes = false;
              if (par.response === 'accept') {
                this.data.current = '1';
                this.origin = '1';
              } else if (par.response === 'decline') {
                this.data.current = '2';
                this.origin = '2';
              } else if (par.response === 'maybe') {
                this.data.current = '3';
                this.origin = '3';
              }
            }
          });
        }
        this.loading = !this.loading;

      }
    );

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

  hide() {
    this.showEvent = false;
  }

  showResponse() {
    this.showEvent = true;
    this.data.current = this.origin;
  }

  goback() {
    this.route.navigate(['/meeting']);
  }

  changeResponse() {
    this.formDate = {};
    if (Number(this.data.current) === 1) {
      this.formDate = {
        response: 'accept'
      };
    } else if (Number(this.data.current) === 2) {
      this.formDate = {
        response: 'decline'
      };
    } else if (Number(this.data.current) === 3) {
      this.formDate = {
        response: 'maybe'
      };
    }
    this.eventService.postEventResponse(this.lookEventId, this.formDate).subscribe(
      data => {
        Swal.fire({
          text: '成功回覆',
          icon: 'success'
        }).then((result) => {
          window.location.reload();
        });
      }, error => {
        Swal.fire({
          text: '回覆失敗！',
          icon: 'error'
        });
      }
    );
  }

  setCurrent(param) {
    this.data.current = param;
  }

}
