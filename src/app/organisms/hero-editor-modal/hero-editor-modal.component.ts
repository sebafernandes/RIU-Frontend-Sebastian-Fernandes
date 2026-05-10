import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CreateHeroDto, Hero } from '@app/models/hero.model';
import { HeroFormComponent } from '@app/molecules/hero-form/hero-form.component';

export type HeroEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-hero-editor-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroFormComponent],
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

  save(ev: { mode: 'create' | 'edit'; dto: CreateHeroDto; id?: string }): void {
    this.saved.emit(ev);
  }
}
