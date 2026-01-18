import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

import { AuthApiService } from '../auth/auth-api';
import { AuthStateService } from '../auth/auth-state';

/**
 * Global 401 handling (business-style):
 * - If a request fails with 401, try POST /auth/refresh once
 * - If refresh succeeds: retry the original request
 * - If refresh fails: clear auth state and redirect to /login (fail-closed)
 *
 * Concurrency:
 * - Ensure only ONE refresh runs at a time, and other 401s wait for it.
 */
let refreshInFlight$: Observable<void> | null = null;

function isAuthEndpoint(url: string): boolean {
    // Prevent infinite loops: do NOT try to refresh if the request is already auth-related
    return (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/me')
    );
}

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const api = inject(AuthApiService);
    const authState = inject(AuthStateService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((err: unknown) => {
            if (!(err instanceof HttpErrorResponse)) {
                return throwError(() => err);
            }

            // Only handle 401s for "normal" API calls (not auth calls themselves)
            if (err.status !== 401 || isAuthEndpoint(req.url)) {
                return throwError(() => err);
            }

            // Start refresh if none in flight; otherwise wait for ongoing refresh
            if (!refreshInFlight$) {
                refreshInFlight$ = api.refresh().pipe(
                    // After refresh, reload /auth/me to sync client state (optional but business-clean)
                    switchMap(() => authState.reloadMe()),
                    // We only care that the chain completed; map to void
                    tap(() => { }),
                    finalize(() => {
                        refreshInFlight$ = null;
                    }),
                    // If refresh fails => fail-closed
                    catchError((refreshErr) => {
                        authState.clear();
                        // Avoid navigation loops
                        router.navigateByUrl('/login');
                        return throwError(() => refreshErr);
                    }),
                    // reloadMe returns MeResponse|null; we want Observable<void>
                    switchMap(() => {
                        return new Observable<void>((sub) => {
                            sub.next();
                            sub.complete();
                        });
                    }),
                );
            }

            // Wait for refresh, then retry the original request once
            return refreshInFlight$.pipe(
                switchMap(() => next(req)),
            );
        }),
    );
};
