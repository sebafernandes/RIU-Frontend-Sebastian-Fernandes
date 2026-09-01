import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroEditorModalComponent } from '@app/organisms/hero-editor-modal/hero-editor-modal.component';

const mockHero: Hero = {
  id: 'z',
  name: 'H',
  alterEgo: 'a',
  universe: 'Marvel',
  description: '1234567890 ab',
  imageUrl: 'https://i',
  source: 'seed',
  createdAt: new Date(),
  updatedAt: new Date(),
  powerstats: {
    intelligence: 1,
    strength: 2,
    speed: 3,
    durability: 4,
    power: 5,
    combat: 6,
  },
};

describe('HeroEditorModalComponent', () => {
  it('renders new hero title when create', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroEditorModalComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroEditorModalComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'create');
    fx.componentRef.setInput('hero', null);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('New hero');
    expect(fx.nativeElement.querySelector('form')).toBeTruthy();
    expect(fx.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('renders edit title when edit', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroEditorModalComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroEditorModalComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'edit');
    fx.componentRef.setInput('hero', mockHero);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Edit hero');
  });

  it('close emits closed', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroEditorModalComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroEditorModalComponent);
    let hit = false;
    fx.componentInstance.closed.subscribe(() => {
      hit = true;
    });
    fx.componentInstance.close();
    expect(hit).toBe(true);
  });
});
