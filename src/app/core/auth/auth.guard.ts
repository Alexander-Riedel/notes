import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthStateService } from './auth-state.service';

export const authGuard: CanActivateFn = () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    return authState.isAuthenticated$.pipe(
        take(1),
        map((isAuthed) => {
            if (isAuthed) return true;
            return router.createUrlTree(['/login']);
        }),
    );
};
