import { TestBed } from '@angular/core/testing';

import { Plant } from './plant';

describe('Plant', () => {
  let service: Plant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Plant);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
