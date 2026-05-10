import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Hero } from '@app/models/hero.model';
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

function mockApiHero(partial?: Partial<SuperheroApiHero>): SuperheroApiHero {
  return {
    id: 1,
    name: 'Spider-Man',
    slug: '1-spider-man',
    powerstats: { ...powerstats },
    biography: {
      fullName: 'Peter Parker',
      alterEgos: '',
      publisher: 'Marvel Comics',
      aliases: [],
      placeOfBirth: 'Queens, New York',
      firstAppearance: '1962',
      alignment: 'good',
    },
    appearance: {
      gender: 'Male',
      race: 'Human',
      height: ["5'10", '178 cm'],
      weight: ['167 lb', '75 kg'],
      eyeColor: 'Hazel',
      hairColor: 'Brown',
    },
    work: { occupation: 'Student', base: 'New York' },
    connections: {
      groupAffiliation: 'Avengers',
      relatives: 'May Parker (aunt)',
    },
    images: {
      xs: 'https://example.com/spidey-xs.png',
      sm: 'https://example.com/spidey-sm.png',
      md: 'https://example.com/spidey.png',
      lg: 'https://example.com/spidey-lg.png',
    },
    ...partial,
  };
}

function listTwelveApiHeroes(): SuperheroApiHero[] {
  return Array.from({ length: 12 }, (_, i) =>
    mockApiHero({ id: i + 1, name: `Hero ${String.fromCharCode(65 + i)}` }),
  );
}

function listForTests(): SuperheroApiHero[] {
  return [
    mockApiHero({ id: 1, name: 'Spider-Man' }),
    mockApiHero({ id: 2, name: 'Hero B' }),
    mockApiHero({ id: 3, name: 'Hero C' }),
    mockApiHero({ id: 4, name: 'Hero D' }),
    mockApiHero({ id: 5, name: 'Hero E' }),
    mockApiHero({ id: 6, name: 'Hero F' }),
  ];
}

function sampleHero(): Hero {
  return {
    id: '9',
    name: 'SAMPLE',
    power: 'p',
    alterEgo: 'a',
    universe: 'Marvel',
    description: '1234567890',
    imageUrl: 'https://example.com/i.png',
    source: 'api',
    createdAt: new Date(),
    updatedAt: new Date(),
    powerstats: { ...powerstats },
  };
}

function gridButtons(fx: ReturnType<typeof TestBed.createComponent<HeroesPage>>): NodeListOf<Element> {
  return fx.nativeElement.querySelectorAll('app-hero-table .grid button');
}

describe('HeroesPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [HeroesPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), HeroService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('loads heroes and shows table', () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero()]);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toMatch(/spider-man/i);
  });

  it('shows at most page size cards in grid', () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush(listTwelveApiHeroes());
    fx.detectChanges();
    expect(gridButtons(fx).length).toBe(10);
  });

  it('opens sidebar for detail', () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero()]);
    fx.detectChanges();
    fx.componentInstance.openView(sampleHero());
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Hero detail');
    expect(fx.nativeElement.textContent).toContain('SAMPLE');
  });

  it('opens editor modal for edit', async () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero()]);
    fx.detectChanges();
    const hero = (await firstValueFrom(TestBed.inject(HeroService).getAll()))[0];
    fx.componentInstance.openEditor('edit', hero);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Edit hero');
  });

  it('opens editor modal for create', () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero()]);
    fx.detectChanges();
    fx.componentInstance.openEditor('create');
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('New hero');
  });

  it('search reloads list', async () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([
      mockApiHero({ id: 1, name: 'Batman' }),
      mockApiHero({ id: 2, name: 'Superman' }),
    ]);
    fx.detectChanges();
    fx.componentInstance.onSearch('BATMAN');
    await vi.advanceTimersByTimeAsync(350);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toMatch(/batman/i);
    expect(gridButtons(fx).length).toBe(1);
  });

  it('table delete runs when confirmed', async () => {
    vi.stubGlobal('confirm', () => true);
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush(listForTests());
    fx.detectChanges();
    const svc = TestBed.inject(HeroService);
    const before = await firstValueFrom(svc.getAll());
    fx.componentInstance.onTableDelete(before[0]);
    await vi.advanceTimersByTimeAsync(450);
    const after = await firstValueFrom(svc.getAll());
    expect(after.length).toBe(before.length - 1);
    vi.unstubAllGlobals();
  });

  it('form save create reloads list', async () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero()]);
    fx.detectChanges();
    fx.componentInstance.onFormSaved({
      mode: 'create',
      dto: {
        name: 'NEWH',
        power: '10',
        alterEgo: 'alt',
        universe: 'Other',
        description: '1234567890 zz',
        imageUrl: 'https://new',
        powerstats: { ...powerstats, power: 10 },
      },
    });
    await vi.advanceTimersByTimeAsync(900);
    fx.detectChanges();
    const list = await firstValueFrom(TestBed.inject(HeroService).getAll());
    expect(list.some((h) => h.name === 'NEWH')).toBe(true);
  });

  it('form save edit reloads list', async () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush([mockApiHero({ id: 99, name: 'Old' })]);
    fx.detectChanges();
    fx.componentInstance.onFormSaved({
      mode: 'edit',
      id: '99',
      dto: {
        name: 'RENAMED',
        power: '10',
        alterEgo: 'alt',
        universe: 'Marvel',
        description: '1234567890 zz',
        imageUrl: 'https://i',
        powerstats: { ...powerstats, power: 10 },
      },
    });
    await vi.advanceTimersByTimeAsync(900);
    fx.detectChanges();
    const updated = (await firstValueFrom(TestBed.inject(HeroService).getAll())).find(
      (h) => h.id === '99',
    );
    expect(updated?.name).toBe('RENAMED');
  });

  it('sidebar delete removes and closes', async () => {
    const fx = TestBed.createComponent(HeroesPage);
    fx.detectChanges();
    http.expectOne(API_ALL).flush(listForTests());
    fx.detectChanges();
    const hero = (await firstValueFrom(TestBed.inject(HeroService).getAll()))[0];
    const name = hero.name;
    fx.componentInstance.openView(hero);
    fx.detectChanges();
    fx.componentInstance.onSidebarDelete(hero);
    await vi.advanceTimersByTimeAsync(450);
    fx.detectChanges();
    const list = await firstValueFrom(TestBed.inject(HeroService).getAll());
    expect(list.every((h) => h.name !== name)).toBe(true);
  });
});
