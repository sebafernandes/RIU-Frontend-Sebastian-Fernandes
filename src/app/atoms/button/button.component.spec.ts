import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonComponent } from '@app/atoms/button/button.component';

describe('ButtonComponent', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(ButtonComponent);
    expect(fx.componentInstance).toBeTruthy();
  });
});
