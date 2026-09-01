import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { Hero } from '@app/models/hero.model';
import { ButtonComponent } from '@app/atoms/button/button.component';
import { FocusOnShowDirective } from '@app/directives/focus-on-show.directive';

@Component({
  selector: 'app-hero-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, DatePipe, FocusOnShowDirective],
  templateUrl: './hero-sidebar.component.html',
  styleUrl: './hero-sidebar.component.scss',
})
export class HeroSidebarComponent {
  readonly open = input(false);
  readonly hero = input<Hero | null>(null);

  readonly closed = output<void>();
  readonly edit = output<void>();
  readonly deleteConfirmed = output<Hero>();
  readonly confirmDelete = signal(false);

  close(): void {
    this.closed.emit();
    this.confirmDelete.set(false);
  }

  onEdit(): void {
    this.edit.emit();
    this.confirmDelete.set(false);
  }

  onConfirmDelete(): void {
    const hero = this.hero();
    if (!hero) return;
    this.deleteConfirmed.emit(hero);
    this.confirmDelete.set(false);
  }
}
