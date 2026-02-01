<?php
require __DIR__ . '/../../includes/db.php';
$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$data = read_json_body();
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');
$email = trim($data['email'] ?? '');
$fullName = trim($data['fullName'] ?? '');
$gender = trim($data['gender'] ?? '');

if ($username === '' || $password === '') {
    json_response(['error' => 'username and password required'], 400);
}

// Check duplicate
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    json_response(['error' => 'username_taken'], 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (username, password_hash, email, fullName, gender) VALUES (?,?,?,?,?)');
$stmt->execute([$username, $hash, $email, $fullName, $gender]);

json_response(['ok' => true]);




