import { afterNextRender, Directive, ElementRef, inject, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appFocusOnShow]',
})
export class FocusOnShowDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly restore =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  constructor() {
    afterNextRender(() => this.host.nativeElement.focus());
  }

  ngOnDestroy(): void {
    this.restore?.focus();
  }
}
