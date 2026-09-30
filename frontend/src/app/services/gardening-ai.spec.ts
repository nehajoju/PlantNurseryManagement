import { TestBed } from '@angular/core/testing';

import { GardeningAi } from './gardening-ai';

describe('GardeningAi', () => {
  let service: GardeningAi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GardeningAi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
