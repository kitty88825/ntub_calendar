import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AddSubscribeComponent } from './add-subscribe/add-subscribe.component';
import { MySubscribeComponent } from './my-subscribe/my-subscribe.component';
import { ExportComponent } from './export/export.component';
import { OfficialAddComponent } from './official-add/official-add.component';
import { OfficialChangeComponent } from './official-change/official-change.component';
import { IndexComponent } from './index/index.component';
import { MainCalendarComponent } from './main-calendar/main-calendar.component';


const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'calendar', component: MainCalendarComponent},
  { path: 'add-schedule', component: AddScheduleComponent},
  { path: 'add-subscribe', component: AddSubscribeComponent},
  { path: 'my-subscribe', component: MySubscribeComponent},
  { path: 'export', component: ExportComponent},
  { path: 'official-add', component: OfficialAddComponent},
  { path: 'official-change', component: OfficialChangeComponent},
  { path: 'index', component: IndexComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
