import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  Observable,
  of,
  delay,
  map,
  tap,
} from 'rxjs';
import type { CreateHeroDto, Hero,  UpdateHeroDto } from '@app/models/hero.model';
import type { SuperheroApiHero, } from '@app/models/superhero-api.model';

const API_ALL = 'https://akabab.github.io/superhero-api/api/all.json';


function apiHeroToHero(apiHero: SuperheroApiHero): Hero {
  const createdAt = new Date(0);
  const biography = apiHero.biography;
  return {
    id: String(apiHero.id),
    name: apiHero.name.toUpperCase(),
    slug: apiHero.slug,
    power: String(apiHero.powerstats.power),
    alterEgo: biography.fullName.trim() || biography.alterEgos.trim() || undefined,
    universe: biography.publisher === 'Marvel Comics' ? 'Marvel' : 'DC',
    description: apiHero.work.occupation.trim() || biography.firstAppearance.trim() || undefined,
    imageUrl: apiHero.images.md || apiHero.images.lg || apiHero.images.sm || apiHero.images.xs,
    source: 'api',
    createdAt,
    updatedAt: createdAt,
    powerstats: { ...apiHero.powerstats },
    apiHero,
  };
}

function dtoToApiHero(dto: CreateHeroDto, id: string): SuperheroApiHero {
  return {
    id: Date.now(),
    name: dto.name,
    slug: `${id}-${dto.name.toLowerCase().replaceAll(' ', '-')}`,
    powerstats: dto.powerstats,
    appearance: {
      gender: '-',
      race: '-',
      height: ['-'],
      weight: ['-'],
      eyeColor: '-',
      hairColor: '-',
    },
    biography: {
      fullName: dto.alterEgo,
      alterEgos: dto.alterEgo,
      aliases: [dto.alterEgo],
      placeOfBirth: '-',
      firstAppearance: '-',
      publisher: dto.universe,
      alignment: 'good',
    },
    work: {
      occupation: dto.description,
      base: '-',
    },
    connections: {
      groupAffiliation: '-',
      relatives: '-',
    },
    images: {
      xs: dto.imageUrl,
      sm: dto.imageUrl,
      md: dto.imageUrl,
      lg: dto.imageUrl,
    },
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
    return this.http
      .get<SuperheroApiHero[]>(API_ALL)
      .pipe(
        map((list) => list.map(apiHeroToHero)),
        tap((heroes) => {
          this.heroes.set(heroes);
          this.cacheLoaded = true;
        }),
        map((heroes) => heroes.map(cloneHero)),
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
      return list
        .filter((h) => h.name.toLowerCase().includes(q))
        .map(cloneHero);
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
    const id = crypto.randomUUID();
    const apiHero = dtoToApiHero(dto, id);
    const hero: Hero = {
      ...dto,
      name: dto.name.toUpperCase(),
      power: String(apiHero.powerstats.power),
      powerstats: { ...apiHero.powerstats },
      apiHero,
      id,
      source: 'local',
      createdAt: now,
      updatedAt: now,
    };
    return of(hero).pipe(
      delay(320),
      tap((h) => {
        this.cacheLoaded = true;
        this.heroes.update((list) => [h, ...list]);
      }),
    );
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    return of(null).pipe(
      delay(320),
      map(() => {
        const idx = this.heroes().findIndex((h) => h.id === id);
        const prev = this.heroes()[idx];
        const next: Hero = {
          ...prev,
          ...dto,
          name: dto.name !== undefined ? dto.name.toUpperCase() : prev.name,
          power: dto.powerstats ? String(dto.powerstats.power) : prev.power,
          powerstats: dto.powerstats ? { ...dto.powerstats } : prev.powerstats,
          id: prev.id,
          createdAt: prev.createdAt,
          updatedAt: new Date(),
        };
        next.apiHero =
          next.source === 'local' ? dtoToApiHero(next as CreateHeroDto, next.id) : prev.apiHero;
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
