import { TestBed } from '@angular/core/testing';

import { CheckoutGuardService } from './checkout-guard.service';

describe('CheckoutGuardService', () => {
  let service: CheckoutGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
