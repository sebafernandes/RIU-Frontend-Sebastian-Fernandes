import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { SuperheroApiHero } from '@app/models/superhero-api.model';
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

describe('HeroService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HeroService],
    });
    http = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('returns all heroes from API on first load', async () => {
    const svc = TestBed.inject(HeroService);
    const p = firstValueFrom(svc.getAll());
    const req = http.expectOne(API_ALL);
    req.flush([mockApiHero(), mockApiHero({ id: 2, name: 'Batman' })]);
    const list = await p;
    expect(list.length).toBe(2);
  });

  it('searchByName is case-insensitive (cold cache)', async () => {
    const svc = TestBed.inject(HeroService);
    const p = firstValueFrom(svc.searchByName('bat'));
    const req = http.expectOne(API_ALL);
    req.flush([
      mockApiHero({ id: 1, name: 'Batman' }),
      mockApiHero({ id: 2, name: 'Superman' }),
    ]);
    const list = await p;
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('BATMAN');
  });

  it('create uppercases name and prepends local hero', async () => {
    const svc = TestBed.inject(HeroService);
    const p = firstValueFrom(
      svc.create({
        name: 'test hero',
        power: 'flight',
        alterEgo: 'secret',
        universe: 'Other',
        description: 'Ten chars min here ok',
        imageUrl: 'https://x.test/img.png',
        powerstats: { ...powerstats },
      }),
    );
    await vi.advanceTimersByTimeAsync(450);
    const h = await p;
    expect(h.name).toBe('TEST HERO');
    expect(h.source).toBe('local');
    const all = await firstValueFrom(svc.getAll());
    expect(all[0]?.id).toBe(h.id);
    expect(all.some((x) => x.id === h.id)).toBe(true);
    http.expectNone(API_ALL);
  });

  it('update uppercases name and updates updatedAt', async () => {
    const svc = TestBed.inject(HeroService);
    const load = firstValueFrom(svc.getAll());
    http.expectOne(API_ALL).flush([mockApiHero({ id: 1, name: 'Web Head' })]);
    await load;
    const pBefore = firstValueFrom(svc.getById('1'));
    await vi.advanceTimersByTimeAsync(250);
    const before = (await pBefore)!;
    const p = firstValueFrom(svc.update('1', { name: 'web head' }));
    await vi.advanceTimersByTimeAsync(450);
    const after = await p;
    expect(after.name).toBe('WEB HEAD');
    expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
    expect(after.createdAt.getTime()).toBe(before.createdAt.getTime());
  });

  it('delete removes hero', async () => {
    const svc = TestBed.inject(HeroService);
    const load = firstValueFrom(svc.getAll());
    http
      .expectOne(API_ALL)
      .flush([mockApiHero({ id: 1 }), mockApiHero({ id: 2, name: 'Other' })]);
    await load;
    const p = firstValueFrom(svc.delete('2'));
    await vi.advanceTimersByTimeAsync(450);
    await p;
    const p2 = firstValueFrom(svc.getById('2'));
    await vi.advanceTimersByTimeAsync(250);
    const gone = await p2;
    expect(gone).toBeUndefined();
  });
});
