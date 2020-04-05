import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialChangeComponent } from './official-change.component';

describe('OfficialChangeComponent', () => {
  let component: OfficialChangeComponent;
  let fixture: ComponentFixture<OfficialChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficialChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
