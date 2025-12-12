import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoordonneesUserComponent } from './edit-coordonnees-user.component';

describe('EditCoordonneesUserComponent', () => {
  let component: EditCoordonneesUserComponent;
  let fixture: ComponentFixture<EditCoordonneesUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCoordonneesUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCoordonneesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
