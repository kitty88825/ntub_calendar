import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCalendarUnstaffComponent } from './add-calendar-unstaff.component';

describe('AddCalendarUnstaffComponent', () => {
  let component: AddCalendarUnstaffComponent;
  let fixture: ComponentFixture<AddCalendarUnstaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCalendarUnstaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCalendarUnstaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
