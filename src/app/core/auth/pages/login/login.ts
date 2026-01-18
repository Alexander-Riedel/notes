import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../auth';
import { AuthStateService } from '../../auth-state';

@Component({
    selector: 'app-login',
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCardModule],
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly authState = inject(AuthStateService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    showLoginButton = true;
    showForm = false;
    hide = signal(true);

    constructor() {
        // If already authenticated, don't show login -> go to home
        this.authState.isAuthenticated$.pipe(take(1)).subscribe((isAuthed) => {
            if (isAuthed) {
                this.router.navigateByUrl('/app/home');
            }
        });
    }

    openForm() {
        this.showLoginButton = false;
        this.showForm = true;
    }

    closeForm() {
        this.showLoginButton = true;
        this.showForm = false;
    }

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    login() {
        const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app/home';

        this.auth.login({ email: 'test@example.com', password: 'test1234' }).subscribe({
            next: () => this.router.navigateByUrl('/app/home'),
            error: (err) => {
                console.error('Login failed', err);
            },
        });
    }
}
