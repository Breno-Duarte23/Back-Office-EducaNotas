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
            email: ['', [Validators.required, Validators.email]], // Troque username por email
            password: ['', Validators.required]
        });
    }

    login() {
        if (this.form.valid) {
            const { email, password } = this.form.value; // Troque username por email
            this.http.post<any>('http://localhost:8080/auth/login', { email, password }) // Troque username por email
                .subscribe({
                    next: (res) => {
                        localStorage.setItem('token', res.token);
                        this.router.navigate(['/']);
                    },
                    error: (err) => {
                        this.error = 'E-mail ou senha inválidos';
                    }
                });
        }
    }
}