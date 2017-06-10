/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManifestService } from './manifest.service';

describe('Service: Manifest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManifestService]
    });
  });

  it('should ...', inject([ManifestService], (service: ManifestService) => {
    expect(service).toBeTruthy();
  }));
});