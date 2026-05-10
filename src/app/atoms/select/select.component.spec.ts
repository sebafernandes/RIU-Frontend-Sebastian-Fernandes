import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { SelectComponent } from '@app/atoms/select/select.component';

describe('SelectComponent', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(SelectComponent);
    fx.componentRef.setInput('control', new FormControl('Marvel'));
    fx.componentRef.setInput('selectId', 's1');
    fx.componentRef.setInput('options', [
      { value: 'Marvel', label: 'Marvel' },
      { value: 'DC', label: 'DC' },
    ]);
    fx.detectChanges();
    expect(fx.nativeElement.querySelector('select')).toBeTruthy();
  });
});
