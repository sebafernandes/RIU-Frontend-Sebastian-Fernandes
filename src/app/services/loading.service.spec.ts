import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LoadingService } from '@app/services/loading.service';

describe('LoadingService', () => {
  it('tracks active operations', () => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    const svc = TestBed.inject(LoadingService);
    expect(svc.loading()).toBe(false);
    svc.show();
    expect(svc.loading()).toBe(true);
    svc.hide();
    expect(svc.loading()).toBe(false);
  });

  it('keeps loading while one operation is still active', () => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    const svc = TestBed.inject(LoadingService);
    svc.show();
    svc.show();
    svc.hide();
    expect(svc.loading()).toBe(true);
    svc.hide();
    expect(svc.loading()).toBe(false);
  });
});
