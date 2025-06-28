import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    providers: [FormBuilder]
})
export class LoginComponent {
    form;
    error: string | null = null;

    constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]], 
            password: ['', Validators.required]
        });
    }

    login() {
        if (this.form.valid) {
            const { email, password } = this.form.value;
            this.http.post(
                'http://localhost:8080/auth/login',
                { email, password },
                { responseType: 'text' } 
            ).subscribe({
                next: (token: string) => {
                    console.log('Token recebido:', token);
                    if (token) {
                        localStorage.setItem('token', token);
                        this.router.navigate(['/home']); 
                        this.error = null;
                    } else {
                        this.error = 'E-mail ou senha inválidos';
                    }
                },
                error: (err) => {
                    console.error('Erro na requisição:', err);
                    this.error = 'E-mail ou senha inválidos';
                }
            });
        }
    }
}