import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLineChartComponent } from './custom-line-chart.component';

describe('CustomLineChartComponent', () => {
  let component: CustomLineChartComponent;
  let fixture: ComponentFixture<CustomLineChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomLineChartComponent]
    });
    fixture = TestBed.createComponent(CustomLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
