import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { UppercaseInputDirective } from '@app/directives/uppercase-input.directive';

@Component({
  selector: 'app-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UppercaseInputDirective],
  template: `<input type="text" [formControl]="c" appUppercaseInput />`,
})
class HostUpper {
  readonly c = new FormControl('');
}

@Component({
  selector: 'app-plain-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UppercaseInputDirective],
  template: `<input type="text" appUppercaseInput />`,
})
class HostPlain {}

describe('UppercaseInputDirective', () => {
  it('uppercases input and form control', async () => {
    await TestBed.configureTestingModule({
      imports: [HostUpper],
    }).compileComponents();
    const fx = TestBed.createComponent(HostUpper);
    fx.detectChanges();
    const input: HTMLInputElement = fx.nativeElement.querySelector('input')!;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    fx.detectChanges();
    expect(input.value).toBe('ABC');
    expect(fx.componentInstance.c.value).toBe('ABC');
  });

  it('does not break plain input', async () => {
    await TestBed.configureTestingModule({
      imports: [HostPlain],
    }).compileComponents();
    const fx = TestBed.createComponent(HostPlain);
    fx.detectChanges();
    const input: HTMLInputElement = fx.nativeElement.querySelector('input')!;
    input.value = 'xy';
    input.dispatchEvent(new Event('input'));
    fx.detectChanges();
    expect(input.value).toBe('XY');
  });
});
