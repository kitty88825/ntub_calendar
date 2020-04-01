import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswdComponent } from './forget-passwd.component';

describe('ForgetPasswdComponent', () => {
  let component: ForgetPasswdComponent;
  let fixture: ComponentFixture<ForgetPasswdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetPasswdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
