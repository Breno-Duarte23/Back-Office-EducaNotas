import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

interface CalendarificResponse {
    response: {
        holidays: Holiday[];
    };
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
    private readonly API_KEY = 'Vrw7TFtFJLYOJ3J2EqpxTmfvX7PZeK9J';
    private readonly BASE_URL = 'https://calendarific.com/api/v2';

    // ✅ Dicionário de tradução PT-BR
    private readonly traducoes: { [key: string]: string } = {
        "New Year's Day": "Ano Novo",
        "Carnival Monday": "Segunda-feira de Carnaval",
        "Carnival Tuesday": "Terça-feira de Carnaval",
        "Carnival end (until 2pm)": "Quarta-feira de Cinzas (até 14h)",
        "Good Friday": "Sexta-feira Santa",
        "Tiradentes Day": "Dia de Tiradentes",
        "Labor Day / May Day": "Dia do Trabalho",
        "Corpus Christi": "Corpus Christi",
        "Independence Day": "Dia da Independência",
        "Our Lady of Aparecida / Children's Day": "Nossa Senhora Aparecida / Dia das Crianças",
        "Public Service Holiday": "Feriado do Servidor Público",
        "All Souls' Day": "Dia de Finados",
        "Republic Proclamation Day": "Proclamação da República",
        "Black Awareness Day": "Dia da Consciência Negra",
        "Christmas Eve (from 2pm)": "Véspera de Natal (a partir das 14h)",
        "Christmas Day": "Natal",
        "New Year's Eve (from 2pm)": "Véspera de Ano Novo (a partir das 14h)"
    };

    private readonly descricoesTraducao: { [key: string]: string } = {
        "New Year's Day is the first day of the year, or January 1, in the Gregorian calendar.": 
            "Ano Novo é o primeiro dia do ano, 1º de janeiro, no calendário gregoriano.",
        "Carnival Monday is a government holiday in Brazil": 
            "Segunda-feira de Carnaval é feriado do governo no Brasil",
        "Carnival has several long-standing traditions in Brazil.": 
            "O Carnaval possui várias tradições de longa data no Brasil.",
        "Ash Wednesday marks the first day of Lent in western Christian churches.": 
            "Quarta-feira de Cinzas marca o primeiro dia da Quaresma nas igrejas cristãs ocidentais.",
        "Good Friday is a global Christian observance two days before Easter Sunday.": 
            "Sexta-feira Santa é uma observância cristã global dois dias antes do Domingo de Páscoa.",
        "Tiradentes Day is a national holiday in Brazil": 
            "Dia de Tiradentes é feriado nacional no Brasil",
        "Labor Day, International Workers' Day, and May Day, is a day off for workers in many countries around the world.": 
            "Dia do Trabalho é um dia de folga para trabalhadores em muitos países ao redor do mundo.",
        "Corpus Christi is a Christian feast in honor of the Holy Eucharist.": 
            "Corpus Christi é uma festa cristã em honra à Sagrada Eucaristia.",
        "Independence Day is a national holiday in Brazil": 
            "Dia da Independência é feriado nacional no Brasil",
        "Our Lady of Aparecida / Children's Day is a national holiday in Brazil": 
            "Nossa Senhora Aparecida / Dia das Crianças é feriado nacional no Brasil",
        "Public Service Holiday is a government holiday in Brazil": 
            "Feriado do Servidor Público é feriado do governo no Brasil",
        "All Souls' Day falls on November 2 each year. It is a day of alms giving and prayers for the dead.": 
            "Dia de Finados ocorre em 2 de novembro de cada ano. É um dia de esmolas e orações pelos mortos.",
        "Republic Proclamation Day is a national holiday in Brazil": 
            "Proclamação da República é feriado nacional no Brasil",
        "Black Awareness Day is a national holiday in Brazil": 
            "Dia da Consciência Negra é feriado nacional no Brasil",
        "Christmas Eve is the day before Christmas Day and falls on December 24 in the Gregorian calendar.": 
            "Véspera de Natal é o dia anterior ao Natal e cai em 24 de dezembro no calendário gregoriano.",
        "Christmas Day is one of the biggest Christian celebrations and falls on December 25 in the Gregorian calendar.": 
            "Natal é uma das maiores celebrações cristãs e cai em 25 de dezembro no calendário gregoriano.",
        "New Year's Eve is the last day of the year, December 31, in the Gregorian calendar.": 
            "Véspera de Ano Novo é o último dia do ano, 31 de dezembro, no calendário gregoriano."
    };

    constructor(private http: HttpClient) {}

    getFeriados(ano: number, pais: string = 'BR'): Observable<CalendarificResponse> {
        const url = `${this.BASE_URL}/holidays?api_key=${this.API_KEY}&country=${pais}&year=${ano}`;
        return this.http.get<CalendarificResponse>(url).pipe(
            map(response => {
                // ✅ Traduz os feriados
                response.response.holidays = response.response.holidays.map(holiday => ({
                    ...holiday,
                    name: this.traducoes[holiday.name] || holiday.name,
                    description: this.descricoesTraducao[holiday.description] || holiday.description
                }));
                return response;
            })
        );
    }
}