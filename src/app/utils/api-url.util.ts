import { environment } from '../../environments/environment';

export const baseApiUrl: string = (environment.apiUrl || '')
    .trim()
    .replace(/[\r\n]+/g, '')
    .replace(/\s+/g, '')
    .replace(/\/+$/, '');

export const API_BASE = 'http://localhost:8080';