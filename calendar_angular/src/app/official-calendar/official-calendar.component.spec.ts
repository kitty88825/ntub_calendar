import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialCalendarComponent } from './official-calendar.component';

describe('OfficialCalendarComponent', () => {
  let component: OfficialCalendarComponent;
  let fixture: ComponentFixture<OfficialCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficialCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
