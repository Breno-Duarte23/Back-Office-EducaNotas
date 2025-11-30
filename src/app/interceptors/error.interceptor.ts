import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        router.navigate(['/login']);
      } else if (err.status === 403) {
        // CSRF inválido/ausente ou permissão: reenviar instruções (pode renovar CSRF se quiser)
        // opcional: chamar um serviço de CSRF para renovar
      }
      return throwError(() => err);
    })
  );
};