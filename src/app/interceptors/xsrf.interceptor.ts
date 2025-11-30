import { HttpInterceptorFn } from '@angular/common/http';

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Se for requisição que precisa de XSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = localStorage.getItem('XSRF-TOKEN');
    const headerName = localStorage.getItem('XSRF-HEADER') || 'X-XSRF-TOKEN';
    
    if (token) {
      console.debug('[XsrfInterceptor] Adicionando header', headerName, token);
      const cloned = req.clone({
        setHeaders: { [headerName]: token }
      });
      return next(cloned);
    }
  }
  
  return next(req);
};