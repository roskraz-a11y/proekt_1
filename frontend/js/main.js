'use strict';

const state = { dashboard: null };
const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) { const item = document.createElement('div'); item.textContent = value; return item.innerHTML; }
function render(data) {
    state.dashboard = data;
    $('#user-name').textContent = data.profile.name;
    $('#wallet-balance').textContent = data.wallet.balance;
    $('#hero-points').textContent = data.wallet.balance;
    $('#completed-count').innerHTML = `${data.stats.completed} <small>заданий</small>`;
    $('#streak-count').innerHTML = `${data.stats.streak} <small>дней</small>`;
    $('#task-list').innerHTML = data.tasks.map((task) => `<article class="task-card ${task.completed ? 'done' : ''}"><span class="task-type">${escapeHtml(task.category)}</span><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.description)}</p><div class="task-footer"><span class="point-chip">+${task.points} баллов</span><button class="complete-button" data-task-id="${task.id}" type="button">${task.completed ? 'Зачтено ✓' : 'Завершить'}</button></div></article>`).join('');
    $('#transaction-list').innerHTML = data.wallet.transactions.map((entry) => `<li><span>${escapeHtml(entry.label)}<br><time>${escapeHtml(entry.date)}</time></span><strong class="income">+${entry.points}</strong></li>`).join('') || '<li>Пока нет начислений.</li>';
    localStorage.setItem('financial-route-last-sync', new Date().toISOString());
}
async function syncDashboard() { try { render(await api.request('dashboard')); } catch (error) { console.error(error); alert(`Не удалось обновить данные: ${error.message}`); } }
async function completeTask(event) { const id = event.target.dataset.taskId; if (!id) return; try { render(await api.request('complete_task', { id })); } catch (error) { alert(error.message); } }
async function createTask(event) { event.preventDefault(); const form = event.target; const title = form.title.value.trim(); const points = Number(form.points.value); if (!title || !points) return; try { render(await api.request('create_task', { title, points })); form.reset(); $('#task-dialog').close(); } catch (error) { alert(error.message); } }
function saveContentIdea(event) { event.preventDefault(); const form = event.target; const ideas = JSON.parse(localStorage.getItem('financial-route-ideas') || '[]'); ideas.push({ title: form.title.value.trim(), channel: form.channel.value, createdAt: new Date().toISOString() }); localStorage.setItem('financial-route-ideas', JSON.stringify(ideas)); $('#draft-status').textContent = 'Сохранено локально'; form.reset(); setTimeout(() => { $('#draft-status').textContent = 'Черновик'; }, 2500); }
function initializeApp() { document.cookie = 'financial_route_seen=1; max-age=2592000; SameSite=Lax'; $('#task-list').addEventListener('click', completeTask); $('#task-form').addEventListener('submit', createTask); $('#content-form').addEventListener('submit', saveContentIdea); $('#add-task-button').addEventListener('click', () => $('#task-dialog').showModal()); $('#theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-theme')); syncDashboard(); }
initializeApp();
