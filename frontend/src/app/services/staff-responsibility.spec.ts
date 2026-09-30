import { TestBed } from '@angular/core/testing';

import { StaffResponsibility } from './staff-responsibility';

describe('StaffResponsibility', () => {
  let service: StaffResponsibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffResponsibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
