<?php
require __DIR__ . '/../../includes/db.php';
$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$data = read_json_body();
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

$stmt = $pdo->prepare('SELECT id, username, password_hash, email, fullName, gender FROM users WHERE username=?');
$stmt->execute([$username]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['error' => 'invalid_credentials'], 401);
}

// mimic session-less API: return profile
unset($user['password_hash']);
json_response(['ok' => true, 'user' => $user]);




