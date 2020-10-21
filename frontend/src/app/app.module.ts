import { TokenInterceptor } from './interceptors/token.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AddSubscribeComponent } from './add-subscribe/add-subscribe.component';
import { ExportComponent } from './export/export.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';
import { IndexComponent } from './index/index.component';
import { MainCalendarComponent } from './main-calendar/main-calendar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpBodyInterceptor } from './interceptors/http-body.interceptor';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { FilterPipe } from '../app/filter.pipe'; // -> imported filter pipe
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { UserTeachComponent } from './user-teach/user-teach.component';
import { JwtModule } from '@auth0/angular-jwt';
import { MeetingComponent } from './meeting/meeting.component';
import { CommonUserComponent } from './common-user/common-user.component';
import { OpenDataComponent } from './open-data/open-data.component';
import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { AddCalendarUnstaffComponent } from './add-calendar-unstaff/add-calendar-unstaff.component';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('1035929255551-0a4248ua8cabhe19s8v946td1i211u5r.apps.googleusercontent.com')
  },
]);

export function provideConfig() {
  return config;
}
@NgModule({
  declarations: [
    AppComponent,
    AddScheduleComponent,
    AddSubscribeComponent,
    ExportComponent,
    OfficialAddComponent,
    OfficialChangeComponent,
    IndexComponent,
    MainCalendarComponent,
    NavbarComponent,
    EditScheduleComponent,
    FilterPipe,
    UserTeachComponent,
    MeetingComponent,
    CommonUserComponent,
    OpenDataComponent,
    AddCalendarComponent,
    AddCalendarUnstaffComponent
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
    HttpClientModule,
    NgbPaginationModule,
    NgbAlertModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    SocialLoginModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: function tokenGetter() {
          return localStorage.getItem('access_token');
        },
      }
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpBodyInterceptor,
      multi: true,
    },
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
