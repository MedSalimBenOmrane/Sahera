import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDecorComponent } from './login-decor.component';

describe('LoginDecorComponent', () => {
  let component: LoginDecorComponent;
  let fixture: ComponentFixture<LoginDecorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginDecorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDecorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
