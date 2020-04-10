import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatSelectModule} from '@angular/material/select';
import { FullCalendarModule} from '@fullcalendar/angular';
import { LoginComponent } from './login/login.component';
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
import { IndexComponent } from './index/index.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MainCalendarComponent } from './main-calendar/main-calendar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
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
    IndexComponent,
    MainCalendarComponent,
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
    CarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
