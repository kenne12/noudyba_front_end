import { TestBed } from '@angular/core/testing';

import { Token.InterceptorService } from './token.interceptor.service';

describe('Token.InterceptorService', () => {
  let service: Token.InterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Token.InterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
