import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '@app/atoms/button/button.component';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly totalItems = input.required<number>();
  readonly pageSize = input(5);
  readonly page = input.required<number>();
  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  readonly canPrev = computed(() => this.page() > 1);
  readonly canNext = computed(() => this.page() < this.totalPages());

  prev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page() - 1);
  }

  next(): void {
    if (this.canNext()) this.pageChange.emit(this.page() + 1);
  }
}
