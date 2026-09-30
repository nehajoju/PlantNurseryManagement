import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GardeningHelp } from './gardening-help';

describe('GardeningHelp', () => {
  let component: GardeningHelp;
  let fixture: ComponentFixture<GardeningHelp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GardeningHelp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GardeningHelp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
