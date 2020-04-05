import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialHeaderComponent } from './official-header.component';

describe('OfficialHeaderComponent', () => {
  let component: OfficialHeaderComponent;
  let fixture: ComponentFixture<OfficialHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficialHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
