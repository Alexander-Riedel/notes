import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Reads a cookie value by name (simple, sufficient for CSRF token cookie).
 */
function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * BFF Session (sid) is HttpOnly -> browser sends it automatically when withCredentials is true.
 * CSRF is double-submit -> readable cookie "csrf" is copied into header "X-CSRF" for write requests.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    // Always include cookies (sid + csrf cookie) in cross-subdomain requests
    let nextReq = req.clone({
        withCredentials: true,
    });

    const method = req.method.toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isStateChanging) {
        const csrf = readCookie('csrf');
        if (csrf) {
            nextReq = nextReq.clone({
                setHeaders: {
                    'X-CSRF': csrf,
                },
            });
        }
    }

    return next(nextReq);
};
