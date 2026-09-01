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
    expect(fx.nativeElement.textContent).toContain('First');
    expect(fx.nativeElement.textContent).toContain('Last');
  });

  it('emits first, previous, next, last and page numbers', async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
    const fx = TestBed.createComponent(PaginationComponent);
    fx.componentRef.setInput('totalItems', 50);
    fx.componentRef.setInput('pageSize', 10);
    fx.componentRef.setInput('page', 3);
    const pages: number[] = [];
    fx.componentInstance.pageChange.subscribe((n) => pages.push(n));
    fx.detectChanges();
    fx.componentInstance.first();
    fx.componentInstance.prev();
    fx.componentInstance.next();
    fx.componentInstance.last();
    fx.componentInstance.goTo(4);
    expect(pages).toEqual([1, 2, 4, 5, 4]);
  });
});
