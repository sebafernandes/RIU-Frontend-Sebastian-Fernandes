import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Hero } from '@app/models/hero.model';

@Component({
  selector: 'app-hero-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.scss',
})
export class HeroCard {
  hero = input<Hero | null>(null);

  averageScore = computed(() => {
    const stats = this.hero()?.powerstats;
    if (!stats) return 0;

    return Math.round(
      (stats.intelligence +
        stats.strength +
        stats.speed +
        stats.durability +
        stats.power +
        stats.combat) /
        6,
    );
  });
}
