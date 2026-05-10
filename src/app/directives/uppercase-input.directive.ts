  import { Directive, HostListener, inject } from '@angular/core';
  import { NgControl } from '@angular/forms';

  @Directive({
    selector: '[appUppercaseInput]',
    standalone: true,
  })
  export class UppercaseInputDirective {
    private readonly ngControl = inject(NgControl, { optional: true, self: true });

    @HostListener('input', ['$event'])
    onInput(ev: Event): void {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
        return;
      }
      const v = target.value.toUpperCase();
      if (target.value === v) return;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      target.value = v;
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(v);
      }
      if (start != null && end != null) {
        target.setSelectionRange(start, end);
      }
    }
  }
