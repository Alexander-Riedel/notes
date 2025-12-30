import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

// Minimal placeholder components (replace with your real ones later)
import { LoginComponent } from './features/auth/login/login.component';
import { AppShellComponent } from './features/shell/app-shell.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'app' },

    // Public
    { path: 'login', component: LoginComponent },

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
