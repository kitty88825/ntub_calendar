import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialAddComponent } from './official-add.component';

describe('OfficialAddComponent', () => {
  let component: OfficialAddComponent;
  let fixture: ComponentFixture<OfficialAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficialAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
