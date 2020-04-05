import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { OfficialCalendarComponent } from './official-calendar/official-calendar.component';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'user-calendar', component: UserCalendarComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forget-passwd', component: ForgetPasswdComponent},
  { path: 'change-passwd', component: ChangePasswdComponent},
  { path: 'add-schedule', component: AddScheduleComponent},
  { path: 'add-meet', component: AddMeetComponent},
  { path: 'add-subscribe', component: AddSubscribeComponent},
  { path: 'my-subscribe', component: MySubscribeComponent},
  { path: 'export', component: ExportComponent},
  { path: 'official-calendar', component: OfficialCalendarComponent},
  { path: 'official-add', component: OfficialAddComponent},
  { path: 'official-change', component: OfficialChangeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
