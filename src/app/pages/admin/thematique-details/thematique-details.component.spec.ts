import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThematiqueDetailsComponent } from './thematique-details.component';

describe('ThematiqueDetailsComponent', () => {
  let component: ThematiqueDetailsComponent;
  let fixture: ComponentFixture<ThematiqueDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThematiqueDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThematiqueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
