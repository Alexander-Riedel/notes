import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Home (protected)</h1>

    <pre>User: {{ (user$ | async) | json }}</pre>
  `,
})
export class HomeComponent {
  private readonly authState = inject(AuthStateService);
  readonly user$ = this.authState.user$;
}
