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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    CollapseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
