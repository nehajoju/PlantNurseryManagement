import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertPopup } from './alert-popup';

describe('AlertPopup', () => {
  let component: AlertPopup;
  let fixture: ComponentFixture<AlertPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
