import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffNavbar } from './staff-navbar';

describe('StaffNavbar', () => {
  let component: StaffNavbar;
  let fixture: ComponentFixture<StaffNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
