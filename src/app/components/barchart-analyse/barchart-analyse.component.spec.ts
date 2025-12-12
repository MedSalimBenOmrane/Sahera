import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarchartAnalyseComponent } from './barchart-analyse.component';

describe('BarchartAnalyseComponent', () => {
  let component: BarchartAnalyseComponent;
  let fixture: ComponentFixture<BarchartAnalyseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarchartAnalyseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarchartAnalyseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
