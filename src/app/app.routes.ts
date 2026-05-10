import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@app/pages/heroes/heroes.page').then((m) => m.HeroesPage),
  },
  { path: '**', redirectTo: '' },
];
