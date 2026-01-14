import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, MatButtonModule],
    templateUrl: './login.html',
    styleUrls: ['login.scss']
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly authState = inject(AuthStateService);
    private readonly router = inject(Router);

    constructor() {
        // If already authenticated, don't show login -> go to home
        this.authState.isAuthenticated$.pipe(take(1)).subscribe((isAuthed) => {
            if (isAuthed) {
                this.router.navigateByUrl('/app/home');
            }
        });
    }

    login() {
        this.auth.login({ email: 'test@example.com', password: 'test1234' }).subscribe({
            next: () => this.router.navigateByUrl('/app/home'),
            error: (err) => {
                console.error('Login failed', err);
            },
        });
    }
}
