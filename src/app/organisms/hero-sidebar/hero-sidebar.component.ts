import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { Hero } from '@app/models/hero.model';
import { ButtonComponent } from '@app/atoms/button/button.component';

export type HeroSidebarMode = 'view' | 'edit' | 'create';

@Component({
  selector: 'app-hero-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, DatePipe],
  templateUrl: './hero-sidebar.component.html',
  styleUrl: './hero-sidebar.component.scss',
})
export class HeroSidebarComponent {
  readonly open = input(false);
  readonly mode = input.required<HeroSidebarMode>();
  readonly hero = input<Hero | null>(null);

  readonly closed = output<void>();
  readonly edit = output<void>();
  readonly deleteConfirmed = output<Hero>();

  readonly confirmDelete = signal(false);

  close = (): void => {
    this.closed.emit();
    this.confirmDelete.set(false);
  };

  onEdit = (): void => {
    this.edit.emit();
    this.confirmDelete.set(false);
  };

  setConfirmDelete = (value: boolean): void => this.confirmDelete.set(value);

  onConfirmDelete = (): void => {
    const h = this.hero();
    if (h) {
      this.deleteConfirmed.emit(h);
      this.confirmDelete.set(false);
    }
  };
}
