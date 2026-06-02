import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroTableComponent } from '@app/molecules/hero-table/hero-table.component';

const powerstats = {
  intelligence: 80,
  strength: 75,
  speed: 90,
  durability: 85,
  power: 70,
  combat: 85,
} as const;

const hero: Hero = {
  id: '1',
  name: 'SPIDER-MAN',
  power: '70',
  alterEgo: 'Peter Parker',
  universe: 'Marvel',
  description: 'Friendly neighborhood hero',
  imageUrl: 'https://example.com/spider.png',
  source: 'api',
  createdAt: new Date(),
  updatedAt: new Date(),
  powerstats: { ...powerstats },
};

describe('HeroTableComponent', () => {
  it('renders skeleton items when loading', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    fx.componentRef.setInput('loading', true);
    fx.componentRef.setInput('skeletonCount', 3);
    fx.detectChanges();
    expect(fx.nativeElement.querySelectorAll('.grid > div').length).toBe(3);
  });

  it('renders hero cards when loaded', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    fx.componentRef.setInput('heroes', [hero]);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('SPIDER-MAN');
    expect(fx.nativeElement.querySelectorAll('.grid button').length).toBe(1);
  });

  it('emits selected hero when card is clicked', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    let selected: Hero | undefined;
    fx.componentInstance.view.subscribe((h) => {
      selected = h;
    });
    fx.componentRef.setInput('heroes', [hero]);
    fx.detectChanges();
    fx.nativeElement.querySelector('.grid button').click();
    expect(selected).toEqual(hero);
  });
});
