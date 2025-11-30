import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './app/interceptors/credentials.interceptor';
import { xsrfInterceptor } from './app/interceptors/xsrf.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,  // ✅ 1º - adiciona withCredentials
        xsrfInterceptor,         // ✅ 2º - adiciona X-XSRF-TOKEN se necessário
        errorInterceptor         // ✅ 3º - trata erros globalmente
      ])
    ),
    // ...outros providers existentes...
  ]
}).catch(err => console.error(err));
