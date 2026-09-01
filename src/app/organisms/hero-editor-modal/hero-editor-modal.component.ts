import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CreateHeroDto, Hero } from '@app/models/hero.model';
import { FocusOnShowDirective } from '@app/directives/focus-on-show.directive';
import { HeroFormComponent } from '@app/molecules/hero-form/hero-form.component';

export type HeroEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-hero-editor-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroFormComponent, FocusOnShowDirective],
  templateUrl: './hero-editor-modal.component.html',
  styleUrl: './hero-editor-modal.component.scss',
})
export class HeroEditorModalComponent {
  readonly open = input(false);
  readonly mode = input<HeroEditorMode>('create');
  readonly hero = input<Hero | null>(null);

  readonly closed = output<void>();
  readonly saved = output<{ mode: 'create' | 'edit'; dto: CreateHeroDto; id?: string }>();

  close(): void {
    this.closed.emit();
  }
}
