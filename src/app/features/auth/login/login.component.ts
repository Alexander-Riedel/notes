import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `
    <h1>Login (placeholder)</h1>

    <button (click)="login()">Login (test)</button>
  `,
})
export class LoginComponent {
    private readonly auth = inject(AuthService);

    login() {
        // TODO: replace with your real form later
        this.auth.login({ email: 'test@example.com', password: 'test1234' }).subscribe();
    }
}
