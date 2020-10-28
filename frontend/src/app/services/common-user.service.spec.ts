import { TestBed } from '@angular/core/testing';

import { CommonUserService } from './common-user.service';

describe('CommonUserService', () => {
  let service: CommonUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
