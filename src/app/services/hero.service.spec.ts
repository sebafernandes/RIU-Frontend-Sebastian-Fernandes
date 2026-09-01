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

const catalog: SuperheroApiHero[] = [
  apiHero(1, 'Spider-Man', 'Marvel Comics'),
  apiHero(2, 'Batman', 'DC Comics'),
];

describe('HeroService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('loads heroes from the Superhero API', async () => {
    const svc = TestBed.inject(HeroService);
    const pending = firstValueFrom(svc.getAll());
    http.expectOne(API_ALL).flush(catalog);
    const list = await pending;
    expect(list.map((h) => h.name)).toEqual(['SPIDER-MAN', 'BATMAN']);
    expect(list.every((h) => h.source === 'api')).toBe(true);
  });

  it('falls back to seed heroes when the API fails', async () => {
    const svc = TestBed.inject(HeroService);
    const pending = firstValueFrom(svc.getAll());
    http.expectOne(API_ALL).flush('error', { status: 500, statusText: 'Server Error' });
    const list = await pending;
    expect(list.some((h) => h.name === 'SPIDER-MAN')).toBe(true);
    expect(list.every((h) => h.source === 'seed')).toBe(true);
  });

  it('searchByName is case-insensitive', async () => {
    const svc = TestBed.inject(HeroService);
    const pending = firstValueFrom(svc.searchByName('bat'));
    http.expectOne(API_ALL).flush(catalog);
    const list = await pending;
    expect(list.map((h) => h.name)).toEqual(['BATMAN']);
  });

  it('create uppercases name and prepends a local hero', async () => {
    const svc = TestBed.inject(HeroService);
    const pending = firstValueFrom(
      svc.create({
        name: 'test hero',
        alterEgo: 'secret',
        universe: 'Other',
        description: 'Ten chars min here ok',
        imageUrl: 'https://x.test/img.png',
        powerstats: { ...powerstats },
      }),
    );
    await vi.advanceTimersByTimeAsync(450);
    const created = await pending;
    expect(created.name).toBe('TEST HERO');
    expect(created.source).toBe('local');
    const all = await firstValueFrom(svc.getAll());
    expect(all[0]?.id).toBe(created.id);
  });

  it('update uppercases name and refreshes updatedAt', async () => {
    const svc = TestBed.inject(HeroService);
    const load = firstValueFrom(svc.getAll());
    http.expectOne(API_ALL).flush(catalog);
    await load;
    const beforePending = firstValueFrom(svc.getById('1'));
    await vi.advanceTimersByTimeAsync(250);
    const before = (await beforePending)!;
    const pending = firstValueFrom(svc.update('1', { name: 'web head' }));
    await vi.advanceTimersByTimeAsync(450);
    const after = await pending;
    expect(after.name).toBe('WEB HEAD');
    expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
    expect(after.createdAt.getTime()).toBe(before.createdAt.getTime());
  });

  it('update errors when the hero does not exist', async () => {
    const svc = TestBed.inject(HeroService);
    const pending = expect(firstValueFrom(svc.update('missing', { name: 'ghost' }))).rejects.toThrow(
      'Hero not found',
    );
    await vi.advanceTimersByTimeAsync(450);
    await pending;
  });

  it('delete removes the hero', async () => {
    const svc = TestBed.inject(HeroService);
    const load = firstValueFrom(svc.getAll());
    http.expectOne(API_ALL).flush(catalog);
    await load;
    const pending = firstValueFrom(svc.delete('2'));
    await vi.advanceTimersByTimeAsync(450);
    await pending;
    const lookup = firstValueFrom(svc.getById('2'));
    await vi.advanceTimersByTimeAsync(250);
    expect(await lookup).toBeUndefined();
  });
});
