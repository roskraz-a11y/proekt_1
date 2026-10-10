'use strict';

class APIClient {
    constructor(baseUrl = 'backend/index.php') { this.baseUrl = baseUrl; }
    async request(action, body = {}) {
        const response = await fetch(`${this.baseUrl}?action=${encodeURIComponent(action)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body), credentials: 'same-origin'
        });
        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
        const payload = await response.json();
        if (!payload.success) throw new Error(payload.error || 'Операция не выполнена');
        return payload.data;
    }
}
const api = new APIClient();
