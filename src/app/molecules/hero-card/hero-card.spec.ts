import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroCard } from './hero-card';

const hero: Hero = {
  id: '1',
  name: 'SPIDER-MAN',
  alterEgo: 'Peter Parker',
  universe: 'Marvel',
  description: 'Friendly neighborhood hero',
  imageUrl: 'https://example.com/spider.png',
  source: 'seed',
  createdAt: new Date(),
  updatedAt: new Date(),
  powerstats: {
    intelligence: 80,
    strength: 75,
    speed: 90,
    durability: 85,
    power: 70,
    combat: 85,
  },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroCard],
  template: `<app-hero-card [hero]="hero" />`,
})
class HostCard {
  hero = hero;
}

describe('HeroCard', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCard],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroCard);
    expect(fx.componentInstance).toBeTruthy();
  });

  it('toggles stats for keyboard and touch', async () => {
    await TestBed.configureTestingModule({
      imports: [HostCard],
    }).compileComponents();
    const fx = TestBed.createComponent(HostCard);
    fx.detectChanges();
    const card = fx.nativeElement.querySelector('app-hero-card') as HTMLElement;
    const button: HTMLButtonElement = card.querySelector('.statsToggle')!;
    expect(card.querySelector('.is-flipped')).toBeFalsy();
    button.click();
    fx.detectChanges();
    expect(card.querySelector('.is-flipped')).toBeTruthy();
  });
});
