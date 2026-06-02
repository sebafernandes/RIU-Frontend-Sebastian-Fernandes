export interface SuperheroApiPowerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

export interface SuperheroApiBiography {
  fullName: string;
  alterEgos: string;
  firstAppearance: string;
  publisher: string;
}

export interface SuperheroApiWork {
  occupation: string;
}

export interface SuperheroApiImages {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}

export interface SuperheroApiHero {
  id: number;
  name: string;
  powerstats: SuperheroApiPowerstats;
  biography: SuperheroApiBiography;
  work: SuperheroApiWork;
  images: SuperheroApiImages;
}
