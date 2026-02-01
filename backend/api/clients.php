<?php
require __DIR__ . '/../includes/db.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM clients WHERE status <> "deleted" ORDER BY id DESC');
    json_response($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = read_json_body();
    $stmt = $pdo->prepare('INSERT INTO clients (businessName, contactPerson, email, phone, address, tin, businessType, monthlyFee, startDate, status, lastPayment) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $data['businessName'] ?? '',
        $data['contactPerson'] ?? '',
        $data['email'] ?? '',
        $data['phone'] ?? '',
        $data['address'] ?? null,
        $data['tin'] ?? null,
        $data['businessType'] ?? 'business',
        $data['monthlyFee'] ?? 0,
        $data['startDate'] ?? null,
        $data['status'] ?? 'active',
        $data['lastPayment'] ?? null,
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM clients WHERE id=?');
    $stmt->execute([$id]);
    json_response($stmt->fetch(), 201);
}

if ($method === 'PUT') {
    $id = (int)($_GET['id'] ?? 0);
    $data = read_json_body();
    $stmt = $pdo->prepare('UPDATE clients SET businessName=?, contactPerson=?, email=?, phone=?, address=?, tin=?, businessType=?, monthlyFee=?, startDate=?, status=?, lastPayment=? WHERE id=?');
    $stmt->execute([
        $data['businessName'] ?? '',
        $data['contactPerson'] ?? '',
        $data['email'] ?? '',
        $data['phone'] ?? '',
        $data['address'] ?? null,
        $data['tin'] ?? null,
        $data['businessType'] ?? 'business',
        $data['monthlyFee'] ?? 0,
        $data['startDate'] ?? null,
        $data['status'] ?? 'active',
        $data['lastPayment'] ?? null,
        $id,
    ]);
    $stmt = $pdo->prepare('SELECT * FROM clients WHERE id=?');
    $stmt->execute([$id]);
    json_response($stmt->fetch());
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('UPDATE clients SET status="deleted" WHERE id=?');
    $stmt->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);





