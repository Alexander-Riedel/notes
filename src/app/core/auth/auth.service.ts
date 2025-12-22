import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

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
        return this.api.login(payload).pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Register -> server sets session cookies -> reload /auth/me -> state updated
     */
    register(payload: RegisterRequest): Observable<MeResponse | null> {
        return this.api.register(payload).pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Refresh (rotation) -> reload /auth/me -> state updated
     * (CSRF is required; interceptor will send X-CSRF automatically)
     */
    refresh(): Observable<MeResponse | null> {
        return this.api.refresh().pipe(
            switchMap(() => this.state.reloadMe()),
        );
    }

    /**
     * Logout -> invalidate session server-side -> clear client state
     * (CSRF is required; interceptor will send X-CSRF automatically)
     */
    logout(): Observable<void> {
        return this.api.logout().pipe(
            tap(() => this.state.clear()),
        );
    }
}
