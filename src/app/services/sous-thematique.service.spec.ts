import { TestBed } from '@angular/core/testing';

import { SousThematiqueService } from './sous-thematique.service';

describe('SousThematiqueService', () => {
  let service: SousThematiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousThematiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
