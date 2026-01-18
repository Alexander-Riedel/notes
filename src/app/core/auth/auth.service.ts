import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
// DEV
import { of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
// DEV END

import {
    AuthApiService,
    LoginRequest,
    RegisterRequest,
    MeResponse,
} from '../api/auth-api.service';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly api = inject(AuthApiService);
    private readonly state = inject(AuthStateService);

    /**
     * Login -> server sets session cookies -> reload /auth/me -> state updated
     */
    login(payload: LoginRequest): Observable<MeResponse | null> {

        // DEV
        if (environment.fakeAuth) {
            const fakeMe: MeResponse = {
                id: 1,
                email: payload.email,
                name: 'Dev User',
            } as any;

            localStorage.setItem('dev_me', JSON.stringify(fakeMe));

            return of(null).pipe(
                delay(100),
                switchMap(() => this.state.reloadMe()),
            );
        }
        // DEV END

        return this.api.login(payload).pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Register -> server sets session cookies -> reload /auth/me -> state updated
     */
    register(payload: RegisterRequest): Observable<MeResponse | null> {

        // DEV
        if (environment.fakeAuth) {
            return this.login({ email: payload.email, password: payload.password } as any);
        }
        // DEV END

        return this.api.register(payload).pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Refresh (rotation) -> reload /auth/me -> state updated
     * (CSRF is required; interceptor will send X-CSRF automatically)
     */
    refresh(): Observable<MeResponse | null> {

        // DEV
        if (environment.fakeAuth) {
            return this.state.reloadMe();
        }
        // DEV END

        return this.api.refresh().pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Logout -> invalidate session server-side -> clear client state
     * (CSRF is required; interceptor will send X-CSRF automatically)
     */
    logout(): Observable<void> {

        // DEV
        if (environment.fakeAuth) {
            this.state.clear();
            return of(void 0);
        }
        // DEV END

        return this.api.logout().pipe(
            tap(() => this.state.clear()),
        );
    }
}
