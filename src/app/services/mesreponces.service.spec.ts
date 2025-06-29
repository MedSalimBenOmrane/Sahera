import { TestBed } from '@angular/core/testing';

import { MesreponcesService } from './mesreponces.service';

describe('MesreponcesService', () => {
  let service: MesreponcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesreponcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
