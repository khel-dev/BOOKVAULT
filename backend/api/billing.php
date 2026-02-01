<?php
require __DIR__ . '/../includes/db.php';
$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM billing_statements ORDER BY created_at DESC');
    json_response($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = read_json_body();
    $stmt = $pdo->prepare('INSERT INTO billing_statements (id_code, clientId, clientName, amount, status, billingPeriodStart, billingPeriodEnd, services_json, notes) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $data['id'] ?? null,
        $data['clientId'] ?? null,
        $data['clientName'] ?? '',
        $data['amount'] ?? 0,
        $data['status'] ?? 'pending',
        $data['billingPeriodStart'] ?? null,
        $data['billingPeriodEnd'] ?? null,
        json_encode($data['services'] ?? []),
        $data['notes'] ?? '',
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM billing_statements WHERE id=?');
    $stmt->execute([$id]);
    json_response($stmt->fetch(), 201);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('DELETE FROM billing_statements WHERE id=?');
    $stmt->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);





