import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CalendarService } from '../services/calendar.service';

interface Option { id: number; name: string; }

interface Holiday {
  name: string;
  description: string;
  date: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
    };
  };
  type: string[];
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class HomeComponent implements OnInit {
    mensagemErro: string | null = null;
    mensagemSucesso: string | null = null;
    modalAberto: 'usuario' | 'aluno' | 'turma' | 'calendario' | null = null;

    formUsuario: any;
    formAluno: any;
    formTurma: any;

    responsaveis: Option[] = [];
    professores: Option[] = [];
    estudantes: Option[] = [];
    turmas: Option[] = [];

    // Calendário/Feriados
    feriados: Holiday[] = [];
    anoSelecionado: number = new Date().getFullYear();
    carregandoFeriados: boolean = false;

    roles = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'EMPLOYEE', label: 'Funcionário' },
        { value: 'TEACHER', label: 'Professor' },
        { value: 'RESPONSIBLE', label: 'Responsável' }
    ];

    constructor(
        private http: HttpClient, 
        private fb: FormBuilder,
        private calendarService: CalendarService
    ) {
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

    ngOnInit(): void {
        this.carregarOpcoes();
    }

    carregarOpcoes(): void {
        this.http.get<Option[]>('http://localhost:8080/users/responsibles', { withCredentials: true })
            .subscribe(r => this.responsaveis = r, () => { });
        this.http.get<Option[]>('http://localhost:8080/users/teachers', { withCredentials: true })
            .subscribe(r => this.professores = r, () => { });
        this.http.get<Option[]>('http://localhost:8080/students/all', { withCredentials: true })
            .subscribe(r => this.estudantes = r, () => { });
        this.http.get<Option[]>('http://localhost:8080/classes/all', { withCredentials: true })
            .subscribe(r => this.turmas = r, () => { });
    }

    abrirModal(tipo: 'usuario' | 'aluno' | 'turma' | 'calendario') {
        this.modalAberto = tipo;
        this.mensagemErro = null;
        this.mensagemSucesso = null;
        this.formUsuario.reset();
        this.formAluno.reset();
        this.formTurma.reset();
        
        if (tipo === 'calendario') {
            this.carregarFeriados();
        } else {
            this.carregarOpcoes();
        }
    }

    fecharModal() {
        this.modalAberto = null;
        this.feriados = [];
    }

    carregarFeriados(): void {
        this.carregandoFeriados = true;
        this.calendarService.getFeriados(this.anoSelecionado).subscribe({
            next: (response) => {
                this.feriados = response.response.holidays.filter(h => 
                    h.type.includes('National holiday') || h.type.includes('Federal holiday')
                );
                this.carregandoFeriados = false;
            },
            error: () => {
                this.mensagemErro = 'Erro ao carregar feriados.';
                this.carregandoFeriados = false;
            }
        });
    }

    mudarAno(direcao: number): void {
        this.anoSelecionado += direcao;
        this.carregarFeriados();
    }

    formatarData(holiday: Holiday): string {
        const { day, month, year } = holiday.date.datetime;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    private validarSenha(senha: string): string | null {
        const erros: string[] = [];
        if (!/[A-Z]/.test(senha)) erros.push('pelo menos uma letra maiúscula');
        if (!/[!@#$%^&*]/.test(senha)) erros.push('pelo menos um caractere especial');
        return erros.length ? 'A senha deve conter ' + erros.join(' e ') + '.' : null;
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
            this.http.post('http://localhost:8080/users/register', usuario)
                .subscribe({
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
            this.http.post('http://localhost:8080/students/register', aluno)
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
                teacherId: +(this.formTurma.value.professorId ?? 0)
            };
            this.http.post('http://localhost:8080/classes/register', turma)
                .subscribe({
                    next: () => {
                        this.mensagemSucesso = 'Turma cadastrada com sucesso!';
                        this.fecharModal();
                    },
                    error: () => this.mensagemErro = 'Erro ao cadastrar turma.'
                });
        }
    }

    baixarRelatorioAlunos(): void {
        this.http.get('http://localhost:8080/reports/students-responsibles', { 
            responseType: 'blob',
            withCredentials: true
        }).subscribe({
            next: (blob: Blob) => this.baixarArquivo(blob, 'relatorio-alunos.pdf'),
            error: () => this.mensagemErro = 'Erro ao baixar relatório de alunos.'
        });
    }

    baixarRelatorioFuncionarios(): void {
        this.http.get('http://localhost:8080/reports/employees-roles', { 
            responseType: 'blob',
            withCredentials: true
        }).subscribe({
            next: (blob: Blob) => this.baixarArquivo(blob, 'relatorio-funcionarios.pdf'),
            error: () => this.mensagemErro = 'Erro ao baixar relatório de funcionários.'
        });
    }

    baixarRelatorioAlunosPorTurma(): void {
        console.debug('[HomeComponent] Baixando relatório de alunos por turma');
        
        this.http.get('http://localhost:8080/reports/students-by-class', {
            responseType: 'blob',
            withCredentials: true
        }).subscribe({
            next: (blob) => {
                console.debug('[HomeComponent] Relatório recebido:', blob);
                this.baixarArquivo(blob, 'relatorio-alunos-por-turma.pdf');
            },
            error: (err) => {
                console.error('[HomeComponent] Erro ao baixar relatório:', err);
                this.mensagemErro = 'Erro ao baixar relatório de alunos por turma.';
            }
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
}