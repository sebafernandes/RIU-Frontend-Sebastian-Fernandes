import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { loadingInterceptor } from '@app/interceptors/loading.interceptor';
import { LoadingService } from '@app/services/loading.service';

describe('loadingInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let loading: LoadingService;

  afterEach(() => {
    http.verify();
  });

  it('shows loading while HTTP request is active', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    loading = TestBed.inject(LoadingService);

    client.get('/heroes').subscribe();
    expect(loading.loading()).toBe(true);
    http.expectOne('/heroes').flush([]);
    expect(loading.loading()).toBe(false);
  });
});
