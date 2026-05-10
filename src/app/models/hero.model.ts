import type { SuperheroApiHero, SuperheroApiPowerstats } from '@app/models/superhero-api.model';

export type HeroUniverse = 'Marvel' | 'DC' | 'Other';

export type HeroSource = 'api' | 'local';

export interface Hero {
  id: string;
  name: string;
  slug?: string;
  power: string;
  alterEgo?: string;
  universe: HeroUniverse;
  description?: string;
  imageUrl: string;
  source: HeroSource;
  createdAt: Date;
  updatedAt: Date;
  powerstats: SuperheroApiPowerstats;
  apiHero?: SuperheroApiHero;
}

export type CreateHeroDto = Omit<
  Hero,
  'id' | 'createdAt' | 'updatedAt' | 'source' | 'alterEgo' | 'description'
> & {
  alterEgo: string;
  description: string;
};

export type UpdateHeroDto = Partial<CreateHeroDto>;

export type { SuperheroApiHero, SuperheroApiPowerstats } from '@app/models/superhero-api.model';
