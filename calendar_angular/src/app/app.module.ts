import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatSelectModule} from '@angular/material/select';
import { FullCalendarModule} from '@fullcalendar/angular';
import { UserCalendarComponent } from './user-calendar/user-calendar.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswdComponent } from './forget-passwd/forget-passwd.component';
import { ChangePasswdComponent } from './change-passwd/change-passwd.component';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AddMeetComponent } from './add-meet/add-meet.component';
import { AddSubscribeComponent } from './add-subscribe/add-subscribe.component';
import { MySubscribeComponent } from './my-subscribe/my-subscribe.component';
import { ExportComponent } from './export/export.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { OfficialCalendarComponent } from './official-calendar/official-calendar.component';
import { OfficialHeaderComponent } from './components/official-header/official-header.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';

@NgModule({
  declarations: [
    AppComponent,
    UserCalendarComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswdComponent,
    ChangePasswdComponent,
    AddScheduleComponent,
    AddMeetComponent,
    AddSubscribeComponent,
    MySubscribeComponent,
    ExportComponent,
    UserHeaderComponent,
    OfficialCalendarComponent,
    OfficialHeaderComponent,
    OfficialAddComponent,
    OfficialChangeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    CollapseModule,
    BsDropdownModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
