import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonUserComponent } from './common-user.component';

describe('CommonUserComponent', () => {
  let component: CommonUserComponent;
  let fixture: ComponentFixture<CommonUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
