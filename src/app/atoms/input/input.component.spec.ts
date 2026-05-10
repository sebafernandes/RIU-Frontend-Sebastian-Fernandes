import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { InputComponent } from '@app/atoms/input/input.component';

describe('InputComponent', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(InputComponent);
    fx.componentRef.setInput('control', new FormControl(''));
    fx.componentRef.setInput('inputId', 't1');
    fx.detectChanges();
    expect(fx.nativeElement.querySelector('input')).toBeTruthy();
  });
});
