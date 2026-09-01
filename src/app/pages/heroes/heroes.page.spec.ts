import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { SuperheroApiHero } from '@app/models/superhero-api.model';
import { HeroesPage } from '@app/pages/heroes/heroes.page';
import { HeroService } from '@app/services/hero.service';

const API_ALL = 'https://akabab.github.io/superhero-api/api/all.json';

const powerstats = {
  intelligence: 80,
  strength: 75,
  speed: 90,
  durability: 85,
  power: 70,
  combat: 85,
} as const;

function apiHero(id: number, name: string, publisher: string): SuperheroApiHero {
  return {
    id,
    name,
    powerstats: { ...powerstats },
    biography: {
      fullName: `${name} alter`,
      alterEgos: '-',
      firstAppearance: '-',
      publisher,
    },
    work: { occupation: 'hero' },
    images: { xs: '', sm: '', md: `https://img.test/${id}.jpg`, lg: '' },
  };
}

const names = [
  'Spider-Man',
  'Batman',
  'Superman',
  'Wonder Woman',
  'Iron Man',
  'Hulk',
  'Aquaman',
  'Flash',
  'Thor',
  'Captain America',
  'Black Widow',
  'Wolverine',
  'Green Lantern',
  'Cyborg',
  'Deadpool',
];

const catalog: SuperheroApiHero[] = names.map((name, i) =>
  apiHero(i + 1, name, i % 2 === 0 ? 'Marvel Comics' : 'DC Comics'),
);

async function allHeroes() {
  return firstValueFrom(TestBed.inject(HeroService).getAll());
}

async function renderPage() {
  const fx = TestBed.createComponent(HeroesPage);
  fx.detectChanges();
  TestBed.inject(HttpTestingController).expectOne(API_ALL).flush(catalog);
  fx.detectChanges();
  return fx;
}

describe('HeroesPage', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [HeroesPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('loads heroes and shows the table', async () => {
    const fx = await renderPage();
    expect(fx.nativeElement.textContent).toMatch(/aquaman/i);
  });

  it('shows at most page-size cards', async () => {
    const fx = await renderPage();
    expect(fx.nativeElement.querySelectorAll('.hero-item').length).toBe(10);
  });

  it('opens the sidebar from the view button', async () => {
    const fx = await renderPage();
    fx.nativeElement.querySelector('.hero-item__view').click();
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Hero detail');
  });

  it('opens the editor from the edit button', async () => {
    const fx = await renderPage();
    fx.nativeElement.querySelector('.hero-item__edit').click();
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Edit hero');
  });

  it('opens the editor for create', async () => {
    const fx = await renderPage();
    fx.componentInstance.openEditor('create');
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('New hero');
  });

  it('search filters the list after debounce', async () => {
    const fx = await renderPage();
    const input: HTMLInputElement = fx.nativeElement.querySelector('input[aria-label="Search heroes by name"]');
    input.value = 'BATMAN';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(650);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toMatch(/batman/i);
    expect(fx.nativeElement.querySelectorAll('.hero-item').length).toBe(1);
  });

  it('shows an empty state when search has no matches', async () => {
    const fx = await renderPage();
    const input: HTMLInputElement = fx.nativeElement.querySelector('input[aria-label="Search heroes by name"]');
    input.value = 'zzzznotahero';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(650);
    fx.detectChanges();
    expect(fx.nativeElement.querySelectorAll('.hero-item').length).toBe(0);
    expect(fx.nativeElement.textContent).toMatch(/no heroes match "zzzznotahero"/i);
  });

  it('deletes a hero from the table when confirmed', async () => {
    vi.stubGlobal('confirm', () => true);
    const fx = await renderPage();
    const before = await allHeroes();
    fx.nativeElement.querySelector('.hero-item__delete').click();
    await vi.advanceTimersByTimeAsync(600);
    const after = await allHeroes();
    expect(after.length).toBe(before.length - 1);
  });

  it('create reloads the list', async () => {
    const fx = await renderPage();
    fx.componentInstance.onFormSaved({
      mode: 'create',
      dto: {
        name: 'NEWH',
        alterEgo: 'alt',
        universe: 'Other',
        description: '1234567890 zz',
        imageUrl: 'https://new',
        powerstats: { ...powerstats, power: 10 },
      },
    });
    await vi.advanceTimersByTimeAsync(900);
    fx.detectChanges();
    const list = await allHeroes();
    expect(list.some((h) => h.name === 'NEWH')).toBe(true);
    const names = fx.componentInstance.listedHeroes().map((h) => h.name);
    expect(names[0]).toBe('NEWH');
  });

  it('edit reloads the list', async () => {
    const fx = await renderPage();
    fx.componentInstance.onFormSaved({
      mode: 'edit',
      id: '1',
      dto: {
        name: 'RENAMED',
        alterEgo: 'alt',
        universe: 'Marvel',
        description: '1234567890 zz',
        imageUrl: 'https://i',
        powerstats: { ...powerstats, power: 10 },
      },
    });
    await vi.advanceTimersByTimeAsync(900);
    fx.detectChanges();
    const updated = (await allHeroes()).find((h) => h.id === '1');
    expect(updated?.name).toBe('RENAMED');
  });

  it('sidebar delete removes the hero and closes the panel', async () => {
    const fx = await renderPage();
    const hero = (await allHeroes())[0];
    const name = hero.name;
    fx.componentInstance.openView(hero);
    fx.detectChanges();
    fx.componentInstance.onSidebarDelete(hero);
    await vi.advanceTimersByTimeAsync(600);
    fx.detectChanges();
    const list = await allHeroes();
    expect(list.every((h) => h.name !== name)).toBe(true);
  });

  it('opens the editor from the sidebar', async () => {
    const fx = await renderPage();
    fx.nativeElement.querySelector('.hero-item__view').click();
    fx.detectChanges();
    fx.componentInstance.onSidebarEdit();
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Edit hero');
  });

  it('changes page size and sort', async () => {
    const fx = await renderPage();
    const pageSize = fx.nativeElement.querySelector('#pageSize') as HTMLSelectElement;
    pageSize.value = '25';
    pageSize.dispatchEvent(new Event('change'));
    fx.detectChanges();
    expect(fx.componentInstance.pageSize()).toBe(25);
    expect(fx.nativeElement.querySelectorAll('.hero-item').length).toBe(15);
    expect(fx.componentInstance.sortMode()).toBe('new-first');

    const sort = fx.nativeElement.querySelector('#sortMode') as HTMLSelectElement;
    sort.value = 'name-desc';
    sort.dispatchEvent(new Event('change'));
    fx.detectChanges();
    expect(fx.componentInstance.sortMode()).toBe('name-desc');
  });
});
