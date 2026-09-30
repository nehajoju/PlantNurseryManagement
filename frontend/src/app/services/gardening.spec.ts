import { TestBed } from '@angular/core/testing';

import { Gardening } from './gardening';

describe('Gardening', () => {
  let service: Gardening;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gardening);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
