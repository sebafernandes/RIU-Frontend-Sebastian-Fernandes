import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Hero } from '@app/models/hero.model';
import { HeroFormComponent } from '@app/molecules/hero-form/hero-form.component';

const powerstats = {
  intelligence: 10,
  strength: 20,
  speed: 30,
  durability: 40,
  power: 50,
  combat: 60,
} as const;

const h: Hero = {
  id: 'z',
  name: 'FORM',
  power: 'pow',
  alterEgo: 'alt',
  universe: 'DC',
  description: '1234567890 ab',
  imageUrl: 'https://i',
  source: 'api',
  createdAt: new Date(),
  updatedAt: new Date(),
  powerstats: { ...powerstats },
};

describe('HeroFormComponent', () => {
  it('creates with hero', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroFormComponent);
    fx.componentRef.setInput('hero', h);
    fx.detectChanges();
    expect(fx.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('onSubmit emits saved for valid form', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroFormComponent);
    fx.componentRef.setInput('hero', null);
    fx.detectChanges();
    let payload: unknown;
    fx.componentInstance.saved.subscribe((e) => {
      payload = e;
    });
    fx.componentInstance.form.setValue({
      name: 'abc',
      alterEgo: 'alt',
      universe: 'Marvel',
      description: '1234567890',
      imageUrl: 'https://i',
      intelligence: 1,
      strength: 2,
      speed: 3,
      durability: 4,
      power: 5,
      combat: 6,
    });
    fx.componentInstance.onSubmit();
    expect(payload).toEqual({
      mode: 'create',
      dto: {
        name: 'ABC',
        power: '5',
        alterEgo: 'alt',
        universe: 'Marvel',
        description: '1234567890',
        imageUrl: 'https://i',
        powerstats: {
          intelligence: 1,
          strength: 2,
          speed: 3,
          durability: 4,
          power: 5,
          combat: 6,
        },
      },
    });
  });

  it('onCancel emits cancelled', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(HeroFormComponent);
    fx.detectChanges();
    let hit = false;
    fx.componentInstance.cancelled.subscribe(() => {
      hit = true;
    });
    fx.componentInstance.onCancel();
    expect(hit).toBe(true);
  });
});
