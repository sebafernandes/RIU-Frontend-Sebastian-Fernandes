import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroSidebarComponent } from '@app/organisms/hero-sidebar/hero-sidebar.component';

const mock: Hero = {
  id: '1',
  name: 'SIDETEST',
  alterEgo: 'a',
  universe: 'DC',
  description: '1234567890 here',
  imageUrl: 'https://x.test/i.png',
  source: 'seed',
  createdAt: new Date('2024-06-01T12:00:00Z'),
  updatedAt: new Date('2024-06-02T12:00:00Z'),
  powerstats: {
    intelligence: 10,
    strength: 20,
    speed: 30,
    durability: 40,
    power: 50,
    combat: 60,
  },
};

async function openSidebar() {
  await TestBed.configureTestingModule({
    imports: [HeroSidebarComponent],
  }).compileComponents();
  const fx = TestBed.createComponent(HeroSidebarComponent);
  fx.componentRef.setInput('open', true);
  fx.componentRef.setInput('hero', mock);
  fx.detectChanges();
  return fx;
}

describe('HeroSidebarComponent', () => {
  it('renders detail fields', async () => {
    const fx = await openSidebar();
    const txt = fx.nativeElement.textContent ?? '';
    expect(txt).toContain('SIDETEST');
    expect(txt).toContain('Universe');
    expect(txt).toContain('Description');
    expect(fx.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fx.nativeElement.querySelector('img').getAttribute('alt')).toBe('SIDETEST');
  });

  it('emits closed when close() runs', async () => {
    const fx = await openSidebar();
    let hit = false;
    fx.componentInstance.closed.subscribe(() => {
      hit = true;
    });
    fx.componentInstance.close();
    expect(hit).toBe(true);
  });

  it('emits edit', async () => {
    const fx = await openSidebar();
    let hit = false;
    fx.componentInstance.edit.subscribe(() => {
      hit = true;
    });
    fx.componentInstance.onEdit();
    expect(hit).toBe(true);
  });

  it('closes from the backdrop', async () => {
    const fx = await openSidebar();
    let hit = false;
    fx.componentInstance.closed.subscribe(() => {
      hit = true;
    });
    const backdrop = fx.nativeElement.querySelector(':scope > div > button') as HTMLButtonElement;
    expect(backdrop.getAttribute('aria-label')).toBe('Close hero detail');
    backdrop.click();
    expect(hit).toBe(true);
  });

  it('confirm delete emits the hero', async () => {
    const fx = await openSidebar();
    let got: Hero | undefined;
    fx.componentInstance.deleteConfirmed.subscribe((h) => {
      got = h;
    });
    fx.componentInstance.confirmDelete.set(true);
    fx.detectChanges();
    fx.componentInstance.onConfirmDelete();
    expect(got).toEqual(mock);
  });

  it('does not render an inline form', async () => {
    const fx = await openSidebar();
    expect(fx.nativeElement.querySelector('form')).toBeFalsy();
  });
});
