import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { OpenDataComponent } from './open-data/open-data.component';
import { CommonUserComponent } from './common-user/common-user.component';
import { MeetingComponent } from './meeting/meeting.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AddSubscribeComponent } from './add-subscribe/add-subscribe.component';
import { ExportComponent } from './export/export.component';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';
import { IndexComponent } from './index/index.component';
import { MainCalendarComponent } from './main-calendar/main-calendar.component';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { UserTeachComponent } from './user-teach/user-teach.component';


const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'calendar', component: MainCalendarComponent },
  { path: 'add-schedule', component: AddScheduleComponent },
  { path: 'add-subscribe', component: AddSubscribeComponent },
  { path: 'export', component: ExportComponent },
  { path: 'official-add', component: OfficialAddComponent },
  { path: 'official-change', component: OfficialChangeComponent },
  { path: 'edit-schedule', component: EditScheduleComponent },
  { path: 'user-teach', component: UserTeachComponent },
  { path: 'meeting', component: MeetingComponent },
  { path: 'common-user', component: CommonUserComponent },
  { path: 'opendata', component: OpenDataComponent },
  { path: 'add-calendar', component: AddCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
