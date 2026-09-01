import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, switchMap, take } from 'rxjs';
import type { CreateHeroDto, Hero } from '@app/models/hero.model';
import { HeroService } from '@app/services/hero.service';
import { LoadingService } from '@app/services/loading.service';
import { PaginationComponent } from '@app/molecules/pagination/pagination.component';
import { HeroTableComponent } from '@app/molecules/hero-table/hero-table.component';
import {
  HeroEditorModalComponent,
  type HeroEditorMode,
} from '@app/organisms/hero-editor-modal/hero-editor-modal.component';
import { HeroSidebarComponent } from '@app/organisms/hero-sidebar/hero-sidebar.component';

type HeroSortMode = 'new-first' | 'name-asc' | 'name-desc';

const byNameAsc = (a: Hero, b: Hero) => a.name.localeCompare(b.name);

function sortHeroes(list: Hero[], mode: HeroSortMode): Hero[] {
  const copy = [...list];
  if (mode === 'name-asc') return copy.sort(byNameAsc);
  if (mode === 'name-desc') return copy.sort((a, b) => b.name.localeCompare(a.name));
  const local = copy.filter((h) => h.source === 'local').sort(byNameAsc);
  const rest = copy.filter((h) => h.source !== 'local').sort(byNameAsc);
  return [...local, ...rest];
}

@Component({
  selector: 'app-heroes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    HeroTableComponent,
    PaginationComponent,
    HeroSidebarComponent,
    HeroEditorModalComponent,
  ],
  templateUrl: './heroes.page.html',
  styleUrl: './heroes.page.scss',
})
export class HeroesPage {
  private readonly heroService = inject(HeroService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly search = new FormControl('', { nonNullable: true });
  readonly pageSize = signal<10 | 25 | 50>(10);
  readonly sortMode = signal<HeroSortMode>('new-first');
  readonly heroes = signal<Hero[]>([]);
  readonly page = signal(1);
  readonly tableLoading = signal(true);
  readonly isLoading = computed(() => this.tableLoading() || this.loadingService.loading());

  readonly sidebarOpen = signal(false);
  readonly sidebarHero = signal<Hero | null>(null);
  readonly editorOpen = signal(false);
  readonly editorMode = signal<HeroEditorMode>('create');
  readonly editorHero = signal<Hero | null>(null);

  readonly listedHeroes = computed(() => sortHeroes(this.heroes(), this.sortMode()));

  readonly pagedHeroes = computed(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.listedHeroes().slice(start, start + size);
  });

  constructor() {
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.fetchHeroes(term)),
        takeUntilDestroyed(),
      )
      .subscribe((list) => this.setList(list));
    this.loadHeroes();
  }

  loadHeroes(): void {
    this.fetchHeroes(this.search.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => this.setList(list));
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  openView(hero: Hero): void {
    this.sidebarHero.set(hero);
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.sidebarHero.set(null);
  }

  onSidebarEdit(): void {
    const hero = this.sidebarHero();
    if (!hero) return;
    this.openEditor('edit', hero);
    this.closeSidebar();
  }

  openEditor(mode: HeroEditorMode, hero: Hero | null = null): void {
    this.editorMode.set(mode);
    this.editorHero.set(hero);
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.editorHero.set(null);
    this.editorMode.set('create');
  }

  onTableDelete(hero: Hero): void {
    if (!globalThis.confirm(`Delete ${hero.name}?`)) return;
    this.heroService
      .delete(hero.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHeroes());
  }

  onSidebarDelete(hero: Hero): void {
    this.heroService
      .delete(hero.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.closeSidebar();
        this.loadHeroes();
      });
  }

  onFormSaved(ev: { mode: 'create' | 'edit'; dto: CreateHeroDto; id?: string }): void {
    const request =
      ev.mode === 'create'
        ? this.heroService.create(ev.dto)
        : ev.id
          ? this.heroService.update(ev.id, ev.dto)
          : null;
    if (!request) return;
    request.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.closeSidebar();
      this.closeEditor();
      this.loadHeroes();
    });
  }

  onPageSizeChange(ev: Event): void {
    const value = Number((ev.target as HTMLSelectElement).value);
    this.pageSize.set(value === 25 || value === 50 ? value : 10);
    this.setPage(1);
  }

  onSortChange(ev: Event): void {
    this.sortMode.set((ev.target as HTMLSelectElement).value as HeroSortMode);
    this.setPage(1);
  }

  private setList(list: Hero[]): void {
    this.heroes.set(list);
    this.setPage(1);
  }

  private fetchHeroes(term: string) {
    this.tableLoading.set(true);
    const request = term.trim()
      ? this.heroService.searchByName(term)
      : this.heroService.getAll();
    return request.pipe(
      take(1),
      finalize(() => this.tableLoading.set(false)),
    );
  }
}
