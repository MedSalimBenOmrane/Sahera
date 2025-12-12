import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesReponsesComponent } from './mes-reponses.component';

describe('MesReponsesComponent', () => {
  let component: MesReponsesComponent;
  let fixture: ComponentFixture<MesReponsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesReponsesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MesReponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
