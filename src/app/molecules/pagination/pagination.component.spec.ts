import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PaginationComponent } from '@app/molecules/pagination/pagination.component';

describe('PaginationComponent', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(PaginationComponent);
    fx.componentRef.setInput('totalItems', 12);
    fx.componentRef.setInput('page', 1);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Page 1');
  });

  it('prev and next emit', async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(PaginationComponent);
    fx.componentRef.setInput('totalItems', 12);
    fx.componentRef.setInput('page', 1);
    const pages: number[] = [];
    fx.componentInstance.pageChange.subscribe((n) => pages.push(n));
    fx.detectChanges();
    fx.componentInstance.next();
    expect(pages).toEqual([2]);
    fx.componentRef.setInput('page', 2);
    fx.detectChanges();
    fx.componentInstance.prev();
    expect(pages).toEqual([2, 1]);
  });
});
