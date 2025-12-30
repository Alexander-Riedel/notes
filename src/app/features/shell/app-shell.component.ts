import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <header style="display:flex; gap:12px; align-items:center; padding:12px; border-bottom:1px solid #ddd;">
      <a routerLink="/app/home">Home</a>

      <span style="margin-left:auto;">
        Auth: {{ (isAuthed$ | async) ? 'yes' : 'no' }}
      </span>

      <button (click)="refresh()">Refresh</button>
      <button (click)="logout()">Logout</button>
    </header>

    <main style="padding:12px;">
      <router-outlet />
    </main>
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly state = inject(AuthStateService);

  readonly isAuthed$ = this.state.isAuthenticated$;

  refresh() {
    this.auth.refresh().subscribe();
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
