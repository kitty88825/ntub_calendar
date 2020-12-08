import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTeachComponent } from './user-teach.component';

describe('UserTeachComponent', () => {
  let component: UserTeachComponent;
  let fixture: ComponentFixture<UserTeachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTeachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTeachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
