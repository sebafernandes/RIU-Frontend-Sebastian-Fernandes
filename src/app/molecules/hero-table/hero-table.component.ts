import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Hero } from '@app/models/hero.model';
import { HeroCard } from '@app/molecules/hero-card/hero-card';

@Component({
  selector: 'app-hero-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroCard],
  templateUrl: './hero-table.component.html',
  styleUrl: './hero-table.component.scss',
})
export class HeroTableComponent {
  heroes = input<Hero[]>([]);
  loading = input(false);
  skeletonCount = input(10);

  view = output<Hero>();
  edit = output<Hero>();
  remove = output<Hero>();

  skeletonItems(): undefined[] {
    return Array.from({ length: this.skeletonCount() });
  }
}
