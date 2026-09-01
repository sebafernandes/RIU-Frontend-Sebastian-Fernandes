export type HeroUniverse = 'Marvel' | 'DC' | 'Other';

export type HeroSource = 'api' | 'seed' | 'local';

export interface HeroPowerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

export interface Hero {
  id: string;
  name: string;
  alterEgo?: string;
  universe: HeroUniverse;
  description?: string;
  imageUrl: string;
  source: HeroSource;
  createdAt: Date;
  updatedAt: Date;
  powerstats: HeroPowerstats;
}

export type CreateHeroDto = Omit<
  Hero,
  'id' | 'createdAt' | 'updatedAt' | 'source' | 'alterEgo' | 'description'
> & {
  alterEgo: string;
  description: string;
};

export type UpdateHeroDto = Partial<CreateHeroDto>;
