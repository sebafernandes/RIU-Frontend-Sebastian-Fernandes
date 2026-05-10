import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly label = input('');
  readonly control = input.required<FormControl<string | null>>();
  readonly selectId = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly error = input('');
}
