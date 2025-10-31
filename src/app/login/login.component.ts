import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule]
})
export class LoginComponent implements OnInit {
  form;
  error: string | null = null;
  passwordType = 'password';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.auth.getCsrf().subscribe({
      next: () => console.log('CSRF inicial obtido'),
      error: () => console.warn('Falha ao obter CSRF inicial')
    });
  }

  login(): void {
    if (!this.form.valid) return;
    const raw = this.form.value;
    const email = (raw?.email ?? '').toString();
    const password = (raw?.password ?? '').toString();

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        if (err?.status === 403) {
          this.auth.getCsrf().subscribe(() => this._snackBar.open('Token CSRF renovado. Tente novamente.', 'Fechar', { duration: 3000 }));
        } else {
          this._snackBar.open('Erro ao autenticar', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
