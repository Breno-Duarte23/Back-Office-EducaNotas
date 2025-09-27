import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  providers: [FormBuilder]
})
export class LoginComponent {
  form;
  error: string | null = null;
  passwordType: string = 'password';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // this.openSnackBar('Teste snackbar');

  }

  // login() {
  //     if (this.form.valid) {
  //         const { email, password } = this.form.value;
  //         this.http.post(
  //             'http://localhost:8080/auth/login',
  //             { email, password },
  //             { responseType: 'text' } 
  //         ).subscribe({
  //             next: (token: string) => {
  //                 console.log('Token recebido:', token);
  //                 if (token) {
  //                     localStorage.setItem('token', token);
  //                     this.router.navigate(['/home']); 
  //                     this.error = null;
  //                 } else {
  //                     this.openSnackBar('E-mail ou senha inválidos.');
  //                 }
  //             },
  //             error: (err) => {
  //                 console.error('Erro na requisição:', err);
  //                 this.error = 'E-mail ou senha inválidos';
  //             }
  //         });
  //     }
  // }

  login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      if (email === 'test@test.com' && password === '123') {
        this.router.navigate(['/home']);
      } else {
        this.openSnackBar('E-mail ou senha inválidos.');
      }
    }
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  openSnackBar(message: string, action: string = 'Fechar') {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

}
