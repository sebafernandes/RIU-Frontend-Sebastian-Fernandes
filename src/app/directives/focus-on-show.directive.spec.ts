import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FocusOnShowDirective } from '@app/directives/focus-on-show.directive';

@Component({
  selector: 'app-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusOnShowDirective],
  template: `<button type="button" appFocusOnShow>Focus me</button>`,
})
class Host {}

describe('FocusOnShowDirective', () => {
  it('focuses the host after render', async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();
    const fx = TestBed.createComponent(Host);
    fx.detectChanges();
    await fx.whenStable();
    const button: HTMLButtonElement = fx.nativeElement.querySelector('button');
    expect(document.activeElement).toBe(button);
  });
});
