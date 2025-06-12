import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenrateQuestionnaireComponent } from './genrate-questionnaire.component';

describe('GenrateQuestionnaireComponent', () => {
  let component: GenrateQuestionnaireComponent;
  let fixture: ComponentFixture<GenrateQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenrateQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenrateQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
