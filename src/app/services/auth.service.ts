import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE } from '../utils/api-url.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly XSRF_STORAGE_KEY = 'XSRF-TOKEN';
    private readonly XSRF_HEADER_STORAGE_KEY = 'XSRF-HEADER';
    private readonly JWT_STORAGE_KEY = 'JWT';

    private authState$ = new BehaviorSubject<boolean>(this.hasToken());
    public readonly isAuthenticated$ = this.authState$.asObservable();

    constructor(private http: HttpClient) { }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.JWT_STORAGE_KEY) || /(^|;)\s*JWT\s*=/.test(document.cookie);
    }

    setAuthenticated(value: boolean): void {
        this.authState$.next(value);
    }

    setXsrfToken(token: string | null): void {
        if (token) {
            localStorage.setItem(this.XSRF_STORAGE_KEY, token);
            try { document.cookie = `XSRF-TOKEN=${encodeURIComponent(token)}; Path=/; SameSite=Lax`; } catch { }
        } else {
            localStorage.removeItem(this.XSRF_STORAGE_KEY);
            try { document.cookie = `XSRF-TOKEN=; Path=/; Max-Age=0`; } catch { }
        }
    }

    getCsrf(): Observable<any> {
        console.debug('[AuthService] getCsrf() chamado');
        const url = `${API_BASE}/auth/csrf`;
        return this.http.get<any>(url).pipe(
            tap(body => {
                console.debug('[AuthService] getCsrf() body:', body);
                if (body?.token) this.setXsrfToken(body.token);
                if (body?.headerName) localStorage.setItem(this.XSRF_HEADER_STORAGE_KEY, body.headerName);
            })
        );
    }

    login(email: string, password: string): Observable<any> {
        console.debug('[AuthService] login() chamado', { email });
        const url = `${API_BASE}/auth/login`;
        return this.http.post<any>(url, { email, password }).pipe(
            tap(body => {
                console.debug('[AuthService] login() body:', body);
                if (body?.token) this.setXsrfToken(body.token);
                if (body?.jwt) localStorage.setItem(this.JWT_STORAGE_KEY, body.jwt);
                if (body?.success) this.setAuthenticated(true);
            })
        );
    }
}

@Injectable({ providedIn: 'root' })
export class ExemploService {
    constructor(private http: HttpClient) { }

    getData(): Observable<any> {
        // ✅ SEMPRE incluir withCredentials: true para enviar cookie JSESSIONID
        return this.http.get(`${API_BASE}/endpoint`, { withCredentials: true });
    }

    postData(data: any): Observable<any> {
        return this.http.post(`${API_BASE}/endpoint`, data, { withCredentials: true });
    }
}