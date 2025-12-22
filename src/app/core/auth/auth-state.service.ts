import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { AuthApiService, MeResponse } from '../api/auth-api.service';

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

    /**
     * Call this once on app start (e.g. in AppComponent).
     * It checks the current session via /auth/me and updates state.
     */
    init(): Observable<boolean> {
        this.loadingSubject.next(true);

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
    }

    /**
     * Convenience: after successful login/register/refresh you can reload /auth/me.
     */
    reloadMe(): Observable<MeResponse | null> {
        this.loadingSubject.next(true);

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
