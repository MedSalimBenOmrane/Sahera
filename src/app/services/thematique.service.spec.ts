import { TestBed } from '@angular/core/testing';

import { ThematiqueService } from './thematique.service';

describe('ThematiqueService', () => {
  let service: ThematiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThematiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
