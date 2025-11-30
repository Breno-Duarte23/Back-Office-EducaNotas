import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error: string | null = null;
  passwordType = 'password';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.debug('[LoginComponent] ngOnInit - preload CSRF');
    this.auth.getCsrf().subscribe({ next: () => console.debug('[LoginComponent] preloaded CSRF'), error: () => { } });
  }

  togglePasswordVisibility(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  login(event?: Event): void {
    console.debug('[LoginComponent] login() called', { valid: this.form.valid, value: this.form.value });
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.form.valid) {
      console.debug('[LoginComponent] form inválido — abortando', { controls: this.form.controls });
      return;
    }

    const raw = this.form.value;
    const email = (raw?.email ?? '').toString();
    const password = (raw?.password ?? '').toString();

    console.debug('[LoginComponent] iniciando fluxo de login', { email });

    this.auth.getCsrf().pipe(
      tap(() => console.debug('[LoginComponent] getCsrf() emitiu')),
      switchMap(() => {
        console.debug('[LoginComponent] chamando auth.login()', { email });
        return this.auth.login(email, password);
      })
    ).subscribe({
      next: (res) => {
        console.debug('[LoginComponent] login retornou sucesso — res:', res);
        this.auth.setAuthenticated(true);
        console.debug('[LoginComponent] auth.setAuthenticated(true) chamado');
        this._snackBar.open('Login bem sucedido', undefined, { duration: 2000 });
        this.router.navigateByUrl('/home', { replaceUrl: true })
          .then(ok => console.debug('[LoginComponent] navigateByUrl ok?', ok))
          .catch(err => console.error('[LoginComponent] falha ao navegar para /home', err));
      },
      error: (err) => {
        console.warn('[LoginComponent] erro no login', err);
        this.error = err?.message ?? 'Erro ao logar';
        this._snackBar.open(this.error ?? 'Erro ao logar', undefined, { duration: 3000 });
      },
      complete: () => console.debug('[LoginComponent] fluxo de subscribe completou')
    });
  }
}
