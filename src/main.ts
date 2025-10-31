import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { withCredentialsInterceptor } from './app/interceptors/with-credentials.interceptor';
import { xsrfInterceptor } from './app/interceptors/xsrf.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';
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
        withCredentialsInterceptor,
        xsrfInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations()
  ]
}).catch(err => console.error(err));
