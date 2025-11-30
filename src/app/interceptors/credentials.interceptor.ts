import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    console.debug('[CredentialsInterceptor] Requisição:', req.url);

    // ✅ Só adiciona withCredentials para requisições ao BACKEND (localhost:8080)
    const isBackendRequest = req.url.includes('localhost:8080');

    if (isBackendRequest) {
        console.debug('[CredentialsInterceptor] Adicionando withCredentials');
        const clonedReq = req.clone({ withCredentials: true });
        return next(clonedReq);
    }

    // ❌ Requisições externas (Calendarific) não recebem withCredentials
    console.debug('[CredentialsInterceptor] Requisição externa - sem withCredentials');
    return next(req);
};