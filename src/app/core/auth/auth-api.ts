import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface MeResponse {
    id: number;
    email: string;
    name?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    /**
     * POST /auth/register
     * Sets sid + csrf cookies (server-side).
     */
    register(payload: RegisterRequest): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/auth/register`, payload);
    }

    /**
     * POST /auth/login
     * Sets/updates sid + csrf cookies (server-side).
     */
    login(payload: LoginRequest): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/auth/login`, payload);
    }

    /**
     * GET /auth/me
     * Requires valid session (sid cookie).
     */
    me(): Observable<MeResponse> {
        return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`);
    }

    /**
     * POST /auth/refresh
     * Rotates session + csrf (CSRF required).
     */
    refresh(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/auth/refresh`, {});
    }

    /**
     * POST /auth/logout
     * Invalidates session server-side (CSRF required).
     */
    logout(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
    }
}
