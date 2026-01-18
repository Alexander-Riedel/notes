import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { csrfInterceptor } from './core/http/csrf.interceptor';
import { AuthStateService } from './core/auth/auth-state';
import { authErrorInterceptor } from './core/http/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor, authErrorInterceptor])),

    // Business-clean bootstrap: check session once before app is considered initialized
    provideAppInitializer(() => {
      const authState = inject(AuthStateService);

      // If the function returns an Observable/Promise, Angular waits until it completes.
      // AuthStateService.init() completes (success or fail-closed).
      return authState.init();
    }),
  ]
};
