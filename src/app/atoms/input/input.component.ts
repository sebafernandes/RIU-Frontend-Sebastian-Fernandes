import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UppercaseInputDirective } from '@app/directives/uppercase-input.directive';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UppercaseInputDirective],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  label = input('');
  control = input.required<FormControl<string | null>>();
  inputId = input.required<string>();
  type = input('text');
  placeholder = input('');
  error = input('');
  uppercase = input(false);
}
