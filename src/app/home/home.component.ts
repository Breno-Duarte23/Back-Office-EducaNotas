import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Option { id: number; name: string; }

@Component({
    selector: 'app-home',
    templateUrl: `./home.component.html`,
    styleUrls: [`./home.component.scss`],
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule]
})
export class HomeComponent implements OnInit {
    mensagemErro: string | null = null;
    mensagemSucesso: string | null = null;
    modalAberto: 'usuario' | 'aluno' | 'turma' | null = null;

    formUsuario;
    formAluno;
    formTurma;

    responsaveis: Option[] = [];
    professores: Option[] = [];
    estudantes: Option[] = [];
    turmas: Option[] = [];

    roles = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'EMPLOYEE', label: 'Funcionário' },
        { value: 'TEACHER', label: 'Professor' },
        { value: 'RESPONSIBLE', label: 'Responsável' }
    ];

    constructor(private http: HttpClient, private fb: FormBuilder) {
        this.formUsuario = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            role: ['', Validators.required]
        });

        this.formAluno = this.fb.group({
            nome: ['', Validators.required],
            idade: ['', Validators.required],
            responsavelId: ['', Validators.required],
            professorId: ['', Validators.required],
            turmaId: ['', Validators.required]
        });

        this.formTurma = this.fb.group({
            nome: ['', Validators.required],
            professorId: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.carregarOpcoes();
    }

    carregarOpcoes() {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : undefined;

        this.http.get<Option[]>('http://localhost:8080/users/responsibles', { headers })
            .subscribe(r => this.responsaveis = r);

        this.http.get<Option[]>('http://localhost:8080/users/teachers', { headers })
            .subscribe(p => this.professores = p);

        this.http.get<Option[]>('http://localhost:8080/students/all', { headers })
            .subscribe(e => this.estudantes = e);

        this.http.get<Option[]>('http://localhost:8080/classes/all', { headers })
            .subscribe(t => this.turmas = t);
    }

    abrirModal(tipo: 'usuario' | 'aluno' | 'turma') {
        this.modalAberto = tipo;
        this.mensagemErro = null;
        this.mensagemSucesso = null;
        this.formUsuario?.reset();
        this.formAluno?.reset();
        this.formTurma?.reset();
        this.carregarOpcoes();
    }

    fecharModal() {
        this.modalAberto = null;
    }

    enviarCadastroUsuario() {
        if (this.formUsuario.valid) {
            this.mensagemErro = null;
            this.mensagemSucesso = null;
            const senha = this.formUsuario.value.password ?? '';
            const erroSenha = this.validarSenha(senha);
            if (erroSenha) {
                this.mensagemErro = erroSenha;
                return;
            }
            if (this.formUsuario.value.password !== this.formUsuario.value.confirmPassword) {
                this.mensagemErro = 'As senhas não coincidem.';
                return;
            }
            const usuario = {
                name: this.formUsuario.value.name ?? '',
                email: this.formUsuario.value.email ?? '',
                password: senha,
                confirmPassword: this.formUsuario.value.confirmPassword ?? '',
                role: this.formUsuario.value.role ?? ''
            };
            const token = localStorage.getItem('token'); 
            this.http.post(
                'http://localhost:8080/users/register',
                usuario,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            ).subscribe({
                next: () => {
                    this.mensagemSucesso = 'Usuário cadastrado com sucesso!';
                    this.fecharModal();
                },
                error: (err) => this.mensagemErro = err?.error || 'Erro ao cadastrar usuário.'
            });
        }
    }

    enviarCadastroAluno() {
        if (this.formAluno.valid) {
            const aluno = {
                name: this.formAluno.value.nome ?? '',
                age: +(this.formAluno.value.idade ?? 0),
                responsibleId: +(this.formAluno.value.responsavelId ?? 0),
                teacherId: +(this.formAluno.value.professorId ?? 0),
                schoolClassId: +(this.formAluno.value.turmaId ?? 0)
            };
            const token = localStorage.getItem('token');
            this.http.post(
                'http://localhost:8080/students/register',
                aluno,
                { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined }
            ).subscribe({
                next: () => {
                    this.mensagemSucesso = 'Aluno cadastrado com sucesso!';
                    this.fecharModal();
                },
                error: () => this.mensagemErro = 'Erro ao cadastrar aluno.'
            });
        }
    }

    enviarCadastroTurma() {
        if (this.formTurma.valid) {
            const turma = {
                name: this.formTurma.value.nome,
                teacherId: +(this.formTurma.value.professorId ?? 0)
            };
            const token = localStorage.getItem('token');
            this.http.post(
                'http://localhost:8080/classes/register',
                turma,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            ).subscribe({
                next: () => {
                    this.mensagemSucesso = 'Turma cadastrada com sucesso!';
                    this.fecharModal();
                },
                error: () => this.mensagemErro = 'Erro ao cadastrar turma.'
            });
        }
    }

    baixarRelatorioAlunos() {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        this.http.get('http://localhost:8080/reports/students-responsibles', { responseType: 'blob', headers })
            .subscribe({
                next: (blob: Blob) => this.baixarArquivo(blob, 'relatorio-alunos.pdf'),
                error: () => this.mensagemErro = 'Erro ao baixar relatório de alunos.'
            });
    }

    baixarRelatorioFuncionarios() {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        this.http.get('http://localhost:8080/reports/employees-roles', { responseType: 'blob', headers })
            .subscribe({
                next: (blob: Blob) => this.baixarArquivo(blob, 'relatorio-funcionarios.pdf'),
                error: () => this.mensagemErro = 'Erro ao baixar relatório de funcionários.'
            });
    }

    baixarRelatorioAlunosPorTurma() {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        this.http.get('http://localhost:8080/reports/students-by-class', { responseType: 'blob', headers })
            .subscribe({
                next: (blob: Blob) => this.baixarArquivo(blob, 'relatorio-alunos-por-turma.pdf'),
                error: () => this.mensagemErro = 'Erro ao baixar relatório de alunos por turma.'
            });
    }

    private baixarArquivo(blob: Blob, nomeArquivo: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        a.click();
        window.URL.revokeObjectURL(url);
        this.mensagemSucesso = 'Download iniciado!';
    }

    private validarSenha(senha: string): string | null {
        const erros: string[] = [];
        if (!/[A-Z]/.test(senha)) {
            erros.push('pelo menos uma letra maiúscula');
        }
        if (!/[!@#$%^&*]/.test(senha)) {
            erros.push('pelo menos um caractere especial');
        }
        return erros.length > 0
            ? 'A senha deve conter ' + erros.join(' e ') + '.'
            : null;
    }
}