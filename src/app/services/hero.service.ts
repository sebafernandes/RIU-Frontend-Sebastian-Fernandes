import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, delay, map, of, tap } from 'rxjs';
import type { CreateHeroDto, Hero, HeroPowerstats, HeroUniverse, UpdateHeroDto } from '@app/models/hero.model';
import type { SuperheroApiHero } from '@app/models/superhero-api.model';

const API_ALL = 'https://akabab.github.io/superhero-api/api/all.json';
const createdAt = new Date(0);

const stats = (
  intelligence: number,
  strength: number,
  speed: number,
  durability: number,
  power: number,
  combat: number,
): HeroPowerstats => ({ intelligence, strength, speed, durability, power, combat });

const seedHero = (
  id: string,
  name: string,
  alterEgo: string,
  universe: HeroUniverse,
  description: string,
  imageUrl: string,
  powerstats: HeroPowerstats,
): Hero => ({
  id,
  name,
  alterEgo,
  universe,
  description,
  imageUrl,
  source: 'seed',
  createdAt,
  updatedAt: createdAt,
  powerstats,
});

const seedHeroes: Hero[] = [
  seedHero('1', 'SPIDER-MAN', 'Peter Parker', 'Marvel', 'Friendly neighborhood hero', 'https://akabab.github.io/superhero-api/api/images/md/620-spider-man.jpg', stats(90, 55, 67, 75, 74, 85)),
  seedHero('2', 'BATMAN', 'Bruce Wayne', 'DC', 'Gotham detective and strategist', 'https://akabab.github.io/superhero-api/api/images/md/70-batman.jpg', stats(100, 26, 27, 50, 47, 100)),
  seedHero('3', 'SUPERMAN', 'Clark Kent', 'DC', 'Kryptonian hero with immense power', 'https://akabab.github.io/superhero-api/api/images/md/644-superman.jpg', stats(94, 100, 100, 100, 100, 85)),
  seedHero('4', 'WONDER WOMAN', 'Diana Prince', 'DC', 'Amazon warrior and ambassador', 'https://akabab.github.io/superhero-api/api/images/md/720-wonder-woman.jpg', stats(88, 100, 79, 100, 100, 100)),
  seedHero('5', 'IRON MAN', 'Tony Stark', 'Marvel', 'Armored inventor and Avenger', 'https://akabab.github.io/superhero-api/api/images/md/346-iron-man.jpg', stats(100, 85, 58, 85, 100, 64)),
  seedHero('6', 'HULK', 'Bruce Banner', 'Marvel', 'Gamma-powered force of nature', 'https://akabab.github.io/superhero-api/api/images/md/332-hulk.jpg', stats(88, 100, 63, 100, 98, 85)),
];

function apiHeroToHero(apiHero: SuperheroApiHero): Hero {
  const biography = apiHero.biography;
  return {
    id: String(apiHero.id),
    name: apiHero.name.toUpperCase(),
    alterEgo: biography.fullName.trim() || biography.alterEgos.trim() || undefined,
    universe: biography.publisher === 'Marvel Comics' ? 'Marvel' : 'DC',
    description: apiHero.work.occupation.trim() || biography.firstAppearance.trim() || undefined,
    imageUrl: apiHero.images.md || apiHero.images.lg || apiHero.images.sm || apiHero.images.xs,
    source: 'api',
    createdAt,
    updatedAt: createdAt,
    powerstats: { ...apiHero.powerstats },
  };
}

function cloneHero(hero: Hero): Hero {
  return {
    ...hero,
    createdAt: new Date(hero.createdAt),
    updatedAt: new Date(hero.updatedAt),
    powerstats: { ...hero.powerstats },
  };
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly http = inject(HttpClient);
  private readonly heroes = signal<Hero[]>([]);
  private cacheLoaded = false;

  getAll(): Observable<Hero[]> {
    if (this.cacheLoaded) {
      return of(this.heroes().map(cloneHero));
    }
    return this.http.get<SuperheroApiHero[]>(API_ALL).pipe(
      map((list) => list.map(apiHeroToHero)),
      catchError(() => of(seedHeroes.map(cloneHero))),
      tap((list) => {
        this.heroes.set(list);
        this.cacheLoaded = true;
      }),
      map((list) => list.map(cloneHero)),
    );
  }

  getById(id: string): Observable<Hero | undefined> {
    return of(null).pipe(
      delay(200),
      map(() => {
        const h = this.heroes().find((x) => x.id === id);
        return h ? cloneHero(h) : undefined;
      }),
    );
  }

  searchByName(term: string): Observable<Hero[]> {
    const filterList = (list: Hero[]): Hero[] => {
      const q = term.trim().toLowerCase();
      if (!q) return list.map(cloneHero);
      return list.filter((h) => h.name.toLowerCase().includes(q)).map(cloneHero);
    };

    if (!this.cacheLoaded) {
      return this.getAll().pipe(map(() => filterList(this.heroes())));
    }

    return of(null).pipe(
      delay(280),
      map(() => filterList(this.heroes())),
    );
  }

  create(dto: CreateHeroDto): Observable<Hero> {
    const now = new Date();
    const hero: Hero = {
      ...dto,
      id: crypto.randomUUID(),
      name: dto.name.toUpperCase(),
      source: 'local',
      createdAt: now,
      updatedAt: now,
      powerstats: { ...dto.powerstats },
    };
    return of(hero).pipe(
      delay(320),
      tap((h) => {
        this.cacheLoaded = true;
        this.heroes.update((list) => [h, ...list]);
      }),
      map(cloneHero),
    );
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    return of(null).pipe(
      delay(320),
      map(() => {
        const idx = this.heroes().findIndex((h) => h.id === id);
        if (idx === -1) throw new Error('Hero not found');
        const prev = this.heroes()[idx];
        const next: Hero = {
          ...prev,
          ...dto,
          name: dto.name !== undefined ? dto.name.toUpperCase() : prev.name,
          powerstats: { ...(dto.powerstats ?? prev.powerstats) },
          id: prev.id,
          createdAt: prev.createdAt,
          updatedAt: new Date(),
        };
        this.heroes.update((list) => list.map((h) => (h.id === id ? next : h)));
        return cloneHero(next);
      }),
    );
  }

  delete(id: string): Observable<void> {
    return of(null).pipe(
      delay(320),
      map(() => {
        this.heroes.update((list) => list.filter((h) => h.id !== id));
      }),
    );
  }
}
