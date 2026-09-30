import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gardening } from './gardening';

describe('Gardening', () => {
  let component: Gardening;
  let fixture: ComponentFixture<Gardening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gardening]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gardening);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
