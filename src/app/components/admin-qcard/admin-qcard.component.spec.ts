import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQCardComponent } from './admin-qcard.component';

describe('AdminQCardComponent', () => {
  let component: AdminQCardComponent;
  let fixture: ComponentFixture<AdminQCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminQCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminQCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
