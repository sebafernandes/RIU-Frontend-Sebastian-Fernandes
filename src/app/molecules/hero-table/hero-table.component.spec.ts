import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroTableComponent } from '@app/molecules/hero-table/hero-table.component';

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

describe('HeroTableComponent', () => {
  it('renders skeleton items when loading', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    fx.componentRef.setInput('loading', true);
    fx.componentRef.setInput('skeletonCount', 3);
    fx.detectChanges();
    expect(fx.nativeElement.querySelectorAll('.skeleton').length).toBe(3);
  });

  it('renders hero cards when loaded', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    fx.componentRef.setInput('heroes', [hero]);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('SPIDER-MAN');
    expect(fx.nativeElement.querySelectorAll('.hero-item').length).toBe(1);
  });

  it('emits view, edit and remove from the row actions', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroTableComponent);
    const viewed: Hero[] = [];
    const edited: Hero[] = [];
    const removed: Hero[] = [];
    fx.componentInstance.view.subscribe((h) => viewed.push(h));
    fx.componentInstance.edit.subscribe((h) => edited.push(h));
    fx.componentInstance.remove.subscribe((h) => removed.push(h));
    fx.componentRef.setInput('heroes', [hero]);
    fx.detectChanges();
    fx.nativeElement.querySelector('.hero-item__view').click();
    fx.nativeElement.querySelector('.hero-item__edit').click();
    fx.nativeElement.querySelector('.hero-item__delete').click();
    expect(viewed).toEqual([hero]);
    expect(edited).toEqual([hero]);
    expect(removed).toEqual([hero]);
  });
});
