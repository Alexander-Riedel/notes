import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthStateService } from './auth-state';

export const authGuard: CanActivateFn = (route, state) => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    return authState.isAuthenticated$.pipe(
        take(1),
        map((isAuthed) => {
            if (isAuthed) return true;

            return router.createUrlTree(['/login'], {
                queryParams: { returnUrl: state.url },
            });
        }),
    );
};
