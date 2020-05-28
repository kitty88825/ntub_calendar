import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AddSubscribeComponent } from './add-subscribe/add-subscribe.component';
import { MySubscribeComponent } from './my-subscribe/my-subscribe.component';
import { ExportComponent } from './export/export.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';
import { IndexComponent } from './index/index.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MainCalendarComponent } from './main-calendar/main-calendar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpBodyInterceptor } from './interceptors/http-body.interceptor';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { FilterPipe } from '../app/filter.pipe'; // -> imported filter pipe
import { AppHttpInterceptorService } from './services/app-http-interceptor.service';


@NgModule({
  declarations: [
    AppComponent,
    AddScheduleComponent,
    AddSubscribeComponent,
    MySubscribeComponent,
    ExportComponent,
    OfficialAddComponent,
    OfficialChangeComponent,
    IndexComponent,
    MainCalendarComponent,
    NavbarComponent,
    EditScheduleComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    CollapseModule,
    BsDropdownModule,
    CarouselModule,
    HttpClientModule,
    NgbPaginationModule,
    NgbAlertModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpBodyInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
