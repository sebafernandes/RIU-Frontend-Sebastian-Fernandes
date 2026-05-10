import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroSidebarComponent } from '@app/organisms/hero-sidebar/hero-sidebar.component';

const powerstats = {
  intelligence: 10,
  strength: 20,
  speed: 30,
  durability: 40,
  power: 50,
  combat: 60,
} as const;

const mock: Hero = {
  id: '1',
  name: 'SIDETEST',
  power: 'p',
  alterEgo: 'a',
  universe: 'DC',
  description: '1234567890 here',
  imageUrl: 'https://x.test/i.png',
  source: 'api',
  createdAt: new Date('2024-06-01T12:00:00Z'),
  updatedAt: new Date('2024-06-02T12:00:00Z'),
  powerstats: { ...powerstats },
};

describe('HeroSidebarComponent', () => {
  it('renders detail fields', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'view');
    fx.componentRef.setInput('hero', mock);
    fx.detectChanges();
    const txt = fx.nativeElement.textContent ?? '';
    expect(txt).toContain('SIDETEST');
    expect(txt).toContain('Universe');
    expect(txt).toContain('Description');
  });

  it('emits closed when close() runs', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'view');
    fx.componentRef.setInput('hero', mock);
    let hit = false;
    fx.componentInstance.closed.subscribe(() => {
      hit = true;
    });
    fx.detectChanges();
    fx.componentInstance.close();
    expect(hit).toBe(true);
  });

  it('emits edit', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'view');
    fx.componentRef.setInput('hero', mock);
    let hit = false;
    fx.componentInstance.edit.subscribe(() => {
      hit = true;
    });
    fx.detectChanges();
    fx.componentInstance.onEdit();
    expect(hit).toBe(true);
  });

  it('backdrop button triggers close via same handler', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'view');
    fx.componentRef.setInput('hero', mock);
    let hit = false;
    fx.componentInstance.closed.subscribe(() => {
      hit = true;
    });
    fx.detectChanges();
    const backdrop = fx.nativeElement.querySelector(
      ':scope > div > button',
    ) as HTMLButtonElement | null;
    expect(backdrop).toBeTruthy();
    backdrop!.click();
    expect(hit).toBe(true);
  });

  it('confirm delete emits hero', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'view');
    fx.componentRef.setInput('hero', mock);
    let got: Hero | undefined;
    fx.componentInstance.deleteConfirmed.subscribe((h) => {
      got = h;
    });
    fx.detectChanges();
    fx.componentInstance.setConfirmDelete(true);
    fx.detectChanges();
    fx.componentInstance.onConfirmDelete();
    expect(got).toEqual(mock);
  });

  it('does not render inline form (edit happens in modal)', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSidebarComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroSidebarComponent);
    fx.componentRef.setInput('open', true);
    fx.componentRef.setInput('mode', 'edit');
    fx.componentRef.setInput('hero', mock);
    fx.detectChanges();
    expect(fx.nativeElement.querySelector('form')).toBeFalsy();
  });
});
