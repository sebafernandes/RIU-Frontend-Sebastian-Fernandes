import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { take, finalize } from 'rxjs';
import type { CreateHeroDto, Hero } from '@app/models/hero.model';
import { HeroService } from '@app/services/hero.service';
import type { SelectOption } from '@app/atoms/select/select.component';
import { PaginationComponent } from '@app/molecules/pagination/pagination.component';
import { HeroTableComponent } from '@app/molecules/hero-table/hero-table.component';
import {
  HeroEditorModalComponent,
  type HeroEditorMode,
} from '@app/organisms/hero-editor-modal/hero-editor-modal.component';
import {
  HeroSidebarComponent,
  type HeroSidebarMode,
} from '@app/organisms/hero-sidebar/hero-sidebar.component';

type HeroSortMode = 'name-asc' | 'name-desc';
type HeroComparer = (a: Hero, b: Hero) => number;

const byNameAsc: HeroComparer = (a, b) => a.name.localeCompare(b.name);
const byNameDesc: HeroComparer = (a, b) => b.name.localeCompare(a.name);

const heroSorters: Record<HeroSortMode, HeroComparer> = {
  'name-asc': byNameAsc,
  'name-desc': byNameDesc,
};

function sortHeroes(list: Hero[], mode: HeroSortMode): Hero[] {
  return [...list].sort(heroSorters[mode]);
}

@Component({
  selector: 'app-heroes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroTableComponent,
    PaginationComponent,
    HeroSidebarComponent,
    HeroEditorModalComponent,
  ],
  templateUrl: './heroes.page.html',
  styleUrl: './heroes.page.scss',
})
export class HeroesPage {
  private heroService = inject(HeroService);

  pageSizeOptions: SelectOption[] = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
  ];

  sortOptions: SelectOption[] = [
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
  ];

  pageSizeNum = signal<10 | 25 | 50>(10);
  sortMode = signal<HeroSortMode>('name-asc');

  heroes = signal<Hero[]>([]);
  searchTerm = signal('');
  page = signal(1);
  tableLoading = signal(true);

  sidebarOpen = signal(false);
  sidebarMode = signal<HeroSidebarMode>('view');
  sidebarHero = signal<Hero | null>(null);
  editorOpen = signal(false);
  editorMode = signal<HeroEditorMode>('create');
  editorHero = signal<Hero | null>(null);

  listedHeroes = computed(() => {
    const locals = this.heroes().filter((h) => h.source === 'local');
    const api = this.heroes().filter((h) => h.source === 'api');
    const mode = this.sortMode();
    return [...sortHeroes(locals, mode), ...sortHeroes(api, mode)];
  });

  pagedHeroes = computed(() => {
    const list = this.listedHeroes();
    const size = this.pageSizeNum();
    const p = this.page();
    const start = (p - 1) * size;
    return list.slice(start, start + size);
  });

  constructor() {
    this.loadHeroes();
  }

  loadHeroes(): void {
    this.tableLoading.set(true);
    const term = this.searchTerm();
    const req = term ? this.heroService.searchByName(term) : this.heroService.getAll();
    req
      .pipe(
        take(1),
        finalize(() => this.tableLoading.set(false)),
      )
      .subscribe((list) => {
        this.heroes.set(list);
        this.setPage(1);
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.loadHeroes();
  }

  onSearchInput(ev: Event): void {
    this.onSearch((ev.target as HTMLInputElement).value);
  }

  setPage(p: number): void {
    this.page.set(p);
  }

  openView(h?: Hero, mode: HeroSidebarMode = 'view'): void {
    this.sidebarHero.set(h ?? null);
    this.sidebarMode.set(mode);
    this.sidebarOpen.set(true);
  }

  onSidebarEdit(): void {
    const hero = this.sidebarHero();
    if (hero) {
      this.openEditor('edit', hero);
      this.closeSidebar();
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.sidebarHero.set(null);
    this.sidebarMode.set('view');
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

  onTableDelete(h: Hero): void {
    if (!globalThis.confirm(`Delete ${h.name}?`)) return;
    this.heroService
      .delete(h.id)
      .pipe(take(1))
      .subscribe(() => this.loadHeroes());
  }

  onSidebarDelete(h: Hero): void {
    this.heroService
      .delete(h.id)
      .pipe(take(1))
      .subscribe(() => {
        this.closeSidebar();
        this.loadHeroes();
      });
  }

  onFormSaved(ev: { mode: 'create' | 'edit'; dto: CreateHeroDto; id?: string }): void {
    if (ev.mode === 'create') {
      this.heroService
        .create(ev.dto)
        .pipe(take(1))
        .subscribe(() => {
          this.closeSidebar();
          this.closeEditor();
          this.loadHeroes();
        });
    } else if (ev.id) {
      this.heroService
        .update(ev.id, ev.dto)
        .pipe(take(1))
        .subscribe(() => {
          this.closeSidebar();
          this.closeEditor();
          this.loadHeroes();
        });
    }
  }

  onFormCancelled(): void {
    this.closeEditor();
  }

  onPageSizeChange(ev: Event): void {
    const val = Number((ev.target as HTMLSelectElement).value);
    this.pageSizeNum.set(val === 25 || val === 50 ? val : 10);
    this.setPage(1);
  }

  onSortChange(ev: Event): void {
    this.sortMode.set((ev.target as HTMLSelectElement).value as HeroSortMode);
    this.setPage(1);
  }
}
