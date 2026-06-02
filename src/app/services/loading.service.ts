import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private active = 0;
  readonly loading = signal(false);

  show(): void {
    this.active += 1;
    this.loading.set(true);
  }

  hide(): void {
    this.active = Math.max(0, this.active - 1);
    this.loading.set(this.active > 0);
  }
}
