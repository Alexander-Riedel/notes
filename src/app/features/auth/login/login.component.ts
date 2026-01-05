import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule],
    template: `
    <h1>Login placeholder</h1>

    <button (click)="login()">Login test</button>
  `,
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    login() {
        this.auth.login({ email: 'test@example.com', password: 'test1234' }).subscribe({
            next: () => this.router.navigateByUrl('/app/home'),
            error: (err) => {
                console.error('Login failed', err);
            },
        });
    }
}
