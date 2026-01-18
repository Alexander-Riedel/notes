import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AUTH_ROUTES } from './core/auth/auth.routes';

// Minimal placeholder components (replace with your real ones later)
import { AppShellComponent } from './shell/app-shell';
import { HomeComponent } from './features/notes/home/home';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'app' },

    // Public (Auth)
    ...AUTH_ROUTES,

    // Protected area
    {
        path: 'app',
        canActivate: [authGuard],
        component: AppShellComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'home' },
            { path: 'home', component: HomeComponent },
            // later: { path: 'notes', component: NotesComponent }, ...
        ],
    },

    // Fallback
    { path: '**', redirectTo: 'app' },
];
