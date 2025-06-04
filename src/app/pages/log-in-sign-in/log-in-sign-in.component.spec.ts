import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInSignINComponent } from './log-in-sign-in.component';

describe('LogInSignINComponent', () => {
  let component: LogInSignINComponent;
  let fixture: ComponentFixture<LogInSignINComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogInSignINComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInSignINComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
