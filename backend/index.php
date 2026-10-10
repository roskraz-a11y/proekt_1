<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

function seedState(): void {
    if (isset($_SESSION['financial_route'])) return;
    $_SESSION['financial_route'] = [
        'profile' => ['name' => 'создатель'],
        'tasks' => [
            ['id' => 'idea', 'category' => 'Контент', 'title' => 'Выбрать одну тему статьи', 'description' => 'Сформулируйте пользу для читателя и рабочий заголовок.', 'points' => 20, 'completed' => false],
            ['id' => 'outline', 'category' => 'Навык', 'title' => 'Собрать план из 5 блоков', 'description' => 'Подготовьте структуру: хук, польза, пример, вывод, следующий шаг.', 'points' => 35, 'completed' => false],
            ['id' => 'budget', 'category' => 'Финансы', 'title' => 'Записать расходы за день', 'description' => 'Зафиксируйте фактические траты без оценки и самокритики.', 'points' => 15, 'completed' => false],
        ], 'wallet' => ['balance' => 0, 'transactions' => []], 'streak' => 1
    ];
}
function respond(array $data, int $status = 200): never { http_response_code($status); echo json_encode(['success' => $status < 400, 'data' => $data], JSON_UNESCAPED_UNICODE); exit; }
function error(string $message, int $status = 400): never { http_response_code($status); echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE); exit; }
function dashboard(): array { $data = $_SESSION['financial_route']; return ['profile' => $data['profile'], 'tasks' => $data['tasks'], 'wallet' => $data['wallet'], 'stats' => ['completed' => count(array_filter($data['tasks'], fn($task) => $task['completed'])), 'streak' => $data['streak']]]; }

seedState();
$action = $_GET['action'] ?? '';
if ($action === 'dashboard') respond(dashboard());
if ($_SERVER['REQUEST_METHOD'] !== 'POST') error('Поддерживается только POST.', 405);
$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($action === 'complete_task') {
    $id = (string)($input['id'] ?? '');
    foreach ($_SESSION['financial_route']['tasks'] as &$task) {
        if ($task['id'] !== $id) continue;
        if (!$task['completed']) { $task['completed'] = true; $_SESSION['financial_route']['wallet']['balance'] += $task['points']; $_SESSION['financial_route']['wallet']['transactions'][] = ['label' => $task['title'], 'points' => $task['points'], 'date' => date('d.m.Y H:i')]; }
        respond(dashboard());
    }
    unset($task); error('Задание не найдено.', 404);
}
if ($action === 'create_task') {
    $title = trim((string)($input['title'] ?? '')); $points = (int)($input['points'] ?? 0);
    if ($title === '' || mb_strlen($title) > 100 || $points < 1 || $points > 1000) error('Проверьте название и награду задания.');
    $_SESSION['financial_route']['tasks'][] = ['id' => bin2hex(random_bytes(6)), 'category' => 'Свой шаг', 'title' => $title, 'description' => 'Личное задание, добавленное в ваш маршрут.', 'points' => $points, 'completed' => false];
    respond(dashboard());
}
error('Неизвестное действие.', 404);
