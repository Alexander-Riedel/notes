import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { AuthApiService, MeResponse } from '../api/auth-api.service';
// DEV
import { environment } from '../../../environments/environment';
// DEV END

@Injectable({ providedIn: 'root' })
export class AuthStateService {
    private readonly api = inject(AuthApiService);

    private readonly userSubject = new BehaviorSubject<MeResponse | null>(null);
    readonly user$: Observable<MeResponse | null> = this.userSubject.asObservable();

    private readonly loadingSubject = new BehaviorSubject<boolean>(false);
    readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

    readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(
        map((user) => !!user),
    );

    // DEV
    /** NEW: allow AuthService (dev) to set user directly */
    setUser(user: MeResponse | null): void {
        this.userSubject.next(user);
    }

    /** Helper for dev persistence */
    private loadDevUser(): MeResponse | null {
        const raw = localStorage.getItem('dev_me');
        if (!raw) return null;
        try {
            return JSON.parse(raw) as MeResponse;
        } catch {
            localStorage.removeItem('dev_me');
            return null;
        }
    }

    /**
     * Call this once on app start (e.g. in AppComponent).
     * It checks the current session via /auth/me and updates state.
     */
    init(): Observable<boolean> {
        this.loadingSubject.next(true);

        // DEV: use localStorage instead of calling backend
        if (environment.fakeAuth) {
            const devUser = this.loadDevUser();
            this.userSubject.next(devUser);
            this.loadingSubject.next(false);
            return of(!!devUser);
        }
        // DEV END


        return this.api.me().pipe(
            tap((me) => this.userSubject.next(me)),
            map(() => true),
            catchError(() => {
                this.userSubject.next(null);
                return of(false);
            }),
            finalize(() => this.loadingSubject.next(false)),
        );
    }

    /**
     * Convenience: manually clear user (e.g. after logout).
     */
    clear(): void {
        this.userSubject.next(null);

        // DEV: clear persisted fake user too
        if (environment.fakeAuth) {
            localStorage.removeItem('dev_me');
        }
        // DEV END
    }

    /**
     * Convenience: after successful login/register/refresh you can reload /auth/me.
     */
    reloadMe(): Observable<MeResponse | null> {
        this.loadingSubject.next(true);

        // DEV: reload from localStorage
        if (environment.fakeAuth) {
            const devUser = this.loadDevUser();
            this.userSubject.next(devUser);
            this.loadingSubject.next(false);
            return of(devUser);
        }
        // DEV END

        return this.api.me().pipe(
            tap((me) => this.userSubject.next(me)),
            catchError(() => {
                this.userSubject.next(null);
                return of(null);
            }),
            finalize(() => this.loadingSubject.next(false)),
        );
    }
}
