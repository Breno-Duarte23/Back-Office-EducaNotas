import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Option { id: number; name: string; }

@Component({
    selector: 'app-home',
    template: `
    <div class="home-container">
        <h1>Bem-vindo!</h1>
        <div class="actions">
            <button (click)="abrirModal('usuario')">Cadastrar Usuário</button>
            <button (click)="abrirModal('aluno')">Cadastrar Aluno</button>
            <button (click)="abrirModal('turma')">Cadastrar turma</button>
            <button (click)="baixarRelatorioAlunos()">Baixar relatório de alunos e seus responsáveis</button>
            <button (click)="baixarRelatorioFuncionarios()">Baixar relatório de funcionários e suas funções</button>
            <button (click)="baixarRelatorioAlunosPorTurma()">Baixar relatório de alunos por turma</button>
        </div>
        <div *ngIf="mensagemErro" class="mensagem erro">{{ mensagemErro }}</div>
        <div *ngIf="mensagemSucesso" class="mensagem sucesso">{{ mensagemSucesso }}</div>

        <!-- Modal de Cadastro de Usuário -->
        <div class="modal-backdrop" *ngIf="modalAberto === 'usuario'">
            <div class="modal">
                <h2>Cadastrar Usuário</h2>
                <form [formGroup]="formUsuario" (ngSubmit)="enviarCadastroUsuario()">
                    <label>
                        Nome:
                        <input formControlName="name" />
                    </label>
                    <label>
                        E-mail:
                        <input formControlName="email" type="email" />
                    </label>
                    <label>
                        Senha:
                        <input formControlName="password" type="password" />
                    </label>
                    <label>
                        Confirmar Senha:
                        <input formControlName="confirmPassword" type="password" />
                    </label>
                    <label>
                        Perfil:
                        <select formControlName="role">
                            <option *ngFor="let r of roles" [value]="r.value">{{ r.label }}</option>
                        </select>
                    </label>
                    <div *ngIf="mensagemErro" class="mensagem erro">{{ mensagemErro }}</div>
                    <div *ngIf="mensagemSucesso" class="mensagem sucesso">{{ mensagemSucesso }}</div>
                    <button type="submit" [disabled]="formUsuario.invalid">Salvar</button>
                    <button type="button" (click)="fecharModal()">Cancelar</button>
                </form>
            </div>
        </div>

        <!-- Modal de Cadastro de Aluno -->
        <div class="modal-backdrop" *ngIf="modalAberto === 'aluno'">
            <div class="modal">
                <h2>Cadastrar Aluno</h2>
                <form [formGroup]="formAluno" (ngSubmit)="enviarCadastroAluno()">
                    <label>
                        Nome:
                        <input formControlName="nome" />
                    </label>
                    <label>
                        Idade:
                        <input formControlName="idade" type="number" />
                    </label>
                    <label>
                        Responsável:
                        <select formControlName="responsavelId">
                            <option *ngFor="let r of responsaveis" [value]="r.id">{{ r.name }}</option>
                        </select>
                    </label>
                    <label>
                        Professor:
                        <select formControlName="professorId">
                            <option *ngFor="let t of professores" [value]="t.id">{{ t.name }}</option>
                        </select>
                    </label>
                    <label>
                        Turma:
                        <select formControlName="turmaId">
                            <option *ngFor="let t of turmas" [value]="t.id">{{ t.name }}</option>
                        </select>
                    </label>
                    <button type="submit" [disabled]="formAluno.invalid">Salvar</button>
                    <button type="button" (click)="fecharModal()">Cancelar</button>
                </form>
            </div>
        </div>

        <!-- Modal de Cadastro de Turma -->
        <div class="modal-backdrop" *ngIf="modalAberto === 'turma'">
            <div class="modal">
                <h2>Cadastrar Turma</h2>
                <form [formGroup]="formTurma" (ngSubmit)="enviarCadastroTurma()">
                    <label>
                        Nome da Turma:
                        <input formControlName="nome" />
                    </label>
                    <label>
                        Professor:
                        <select formControlName="professorId">
                            <option *ngFor="let t of professores" [value]="t.id">{{ t.name }}</option>
                        </select>
                    </label>
                    <label>
                        Estudantes:
                        <select formControlName="estudantesIds" multiple>
                            <option *ngFor="let s of estudantes" [value]="s.id">{{ s.name }}</option>
                        </select>
                    </label>
                    <button type="submit" [disabled]="formTurma.invalid">Salvar</button>
                    <button type="button" (click)="fecharModal()">Cancelar</button>
                </form>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .home-container { display: flex; flex-direction: column; align-items: center; height: 80vh; justify-content: center; }
    .actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    button { padding: 0.75rem 1.5rem; font-size: 1rem; border-radius: 4px; border: none; background: #7702FF; color: #fff; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #4e0177; }
    .mensagem {
        margin-top: 2rem;
        font-weight: bold;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        text-align: center;
    }
    .mensagem.erro {
        color: #d32f2f;
        background: #ffeaea;
        border: 1px solid #d32f2f;
    }
    .mensagem.sucesso {
        color: #388e3c;
        background: #eaffea;
        border: 1px solid #388e3c;
    }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; padding: 2rem; border-radius: 8px; min-width: 320px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .modal h2 { margin-top: 0; }
    .modal label { display: block; margin-bottom: 1rem; }
    .modal input, .modal select { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #ccc; border-radius: 4px; }
    .modal button { margin-right: 1rem; }
  `],
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
            professorId: ['', Validators.required],
            estudantesIds: [[], Validators.required]
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

        this.http.get<Option[]>('http://localhost:8080/estudantes', { headers })
            .subscribe(e => this.estudantes = e);

        this.http.get<Option[]>('http://localhost:8080/turmas', { headers })
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
                'http://localhost:8080/auth/register',
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
                responsible: { id: +(this.formAluno.value.responsavelId ?? 0) },
                teacher: { id: +(this.formAluno.value.professorId ?? 0) },
                schoolClass: { id: +(this.formAluno.value.turmaId ?? 0) }
            };
            this.http.post('http://localhost:8080/alunos', aluno)
                .subscribe({
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
                teacher: { id: +(this.formTurma.value.professorId ?? 0) },
                students: ((this.formTurma.value.estudantesIds ?? []) as any[]).map(id => ({ id: +id }))
            };
            this.http.post('http://localhost:8080/turmas', turma)
                .subscribe({
                    next: () => {
                        this.mensagemSucesso = 'Turma cadastrada com sucesso!';
                        this.fecharModal();
                    },
                    error: () => this.mensagemErro = 'Erro ao cadastrar turma.'
                });
        }
    }

    baixarRelatorioAlunos() {
        this.http.get('http://localhost:8080/relatorios/alunos', { responseType: 'blob' })
            .subscribe({
                next: (blob) => this.baixarArquivo(blob, 'relatorio-alunos.xlsx'),
                error: () => this.mensagemErro = 'Erro ao baixar relatório de alunos.'
            });
    }

    baixarRelatorioFuncionarios() {
        this.http.get('http://localhost:8080/relatorios/funcionarios', { responseType: 'blob' })
            .subscribe({
                next: (blob) => this.baixarArquivo(blob, 'relatorio-funcionarios.xlsx'),
                error: () => this.mensagemErro = 'Erro ao baixar relatório de funcionários.'
            });
    }

    baixarRelatorioAlunosPorTurma() {
        this.http.get('http://localhost:8080/relatorios/alunos-por-turma', { responseType: 'blob' })
            .subscribe({
                next: (blob) => this.baixarArquivo(blob, 'relatorio-alunos-por-turma.xlsx'),
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