import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateHeroDto, Hero, HeroUniverse } from '@app/models/hero.model';
import { InputComponent } from '@app/atoms/input/input.component';
import { SelectComponent } from '@app/atoms/select/select.component';
import { ButtonComponent } from '@app/atoms/button/button.component';

@Component({
  selector: 'app-hero-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
})
export class HeroFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly hero = input<Hero | null>(null);
  readonly saved = output<{ mode: 'create' | 'edit'; dto: CreateHeroDto; id?: string }>();
  readonly cancelled = output<void>();

  readonly universeOptions = [
    { value: 'Marvel' as HeroUniverse, label: 'Marvel' },
    { value: 'DC' as HeroUniverse, label: 'DC' },
    { value: 'Other' as HeroUniverse, label: 'Other' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    alterEgo: ['', Validators.required],
    universe: ['Marvel', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    imageUrl: ['', Validators.required],
    intelligence: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    strength: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    speed: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    durability: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    power: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    combat: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  constructor() {
    effect(() => {
      const h = this.hero();
      if (h) {
        this.form.patchValue({
          name: h.name,
          alterEgo: h.alterEgo ?? '',
          universe: h.universe,
          description: h.description ?? '',
          imageUrl: h.imageUrl,
          intelligence: h.powerstats?.intelligence ?? 0,
          strength: h.powerstats?.strength ?? 0,
          speed: h.powerstats?.speed ?? 0,
          durability: h.powerstats?.durability ?? 0,
          power: h.powerstats?.power ?? (Number(h.power) || 0),
          combat: h.powerstats?.combat ?? 0,
        });
      } else {
        this.form.reset({
          name: '',
          alterEgo: '',
          universe: 'Marvel',
          description: '',
          imageUrl: '',
          intelligence: 0,
          strength: 0,
          speed: 0,
          durability: 0,
          power: 0,
          combat: 0,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CreateHeroDto = {
      name: v.name.toUpperCase(),
      power: String(v.power),
      alterEgo: v.alterEgo,
      universe: v.universe as HeroUniverse,
      description: v.description,
      imageUrl: v.imageUrl,
      powerstats: {
        intelligence: v.intelligence,
        strength: v.strength,
        speed: v.speed,
        durability: v.durability,
        power: v.power,
        combat: v.combat,
      },
    };
    const h = this.hero();
    if (h) {
      this.saved.emit({ mode: 'edit', dto, id: h.id });
    } else {
      this.saved.emit({ mode: 'create', dto });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
