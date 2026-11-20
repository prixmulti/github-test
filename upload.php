<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Kun POST er tilladt.']);
    exit;
}

$baseDir = __DIR__;
$dataDir = $baseDir . '/data';
$uploadDir = $baseDir . '/uploads';
$jsonPath = $dataDir . '/hilsner.json';

foreach ([$dataDir, $uploadDir] as $dir) {
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Kunne ikke oprette mappe på serveren.']);
        exit;
    }
}

$message = trim((string) ($_POST['message'] ?? ''));
$name = trim((string) ($_POST['name'] ?? 'Anonym'));

if ($message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Skriv en hilsen.']);
    exit;
}

if (mb_strlen($message) > 2000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Hilsenen er for lang (max 2000 tegn).']);
    exit;
}

if (mb_strlen($name) > 120) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Navnet er for langt.']);
    exit;
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Vælg et billede.']);
    exit;
}

$file = $_FILES['image'];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Upload fejlede. Prøv et mindre billede.']);
    exit;
}

$maxBytes = 12 * 1024 * 1024;
if (($file['size'] ?? 0) > $maxBytes) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Billedet er for stort (max 12 MB).']);
    exit;
}

$mime = '';
if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']) ?: '';
} elseif (function_exists('mime_content_type')) {
    $mime = mime_content_type($file['tmp_name']) ?: '';
}

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    'image/heic' => 'heic',
    'image/heif' => 'heif',
];

if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Ugyldigt billedformat. Brug JPG, PNG, GIF, WEBP eller HEIC.',
    ]);
    exit;
}

$id = bin2hex(random_bytes(8));
$ext = $allowed[$mime];
$filename = $id . '.' . $ext;
$target = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Kunne ikke gemme billedet.']);
    exit;
}

$entry = [
    'id' => $id,
    'name' => $name !== '' ? $name : 'Anonym',
    'message' => $message,
    'image' => 'uploads/' . $filename,
    'created' => gmdate('c'),
];

$list = [];
if (is_file($jsonPath)) {
    $decoded = json_decode((string) file_get_contents($jsonPath), true);
    if (is_array($decoded)) {
        $list = $decoded;
    }
}

$list[] = $entry;

$encoded = json_encode($list, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($encoded === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Kunne ikke gemme hilsen.']);
    exit;
}

if (file_put_contents($jsonPath, $encoded, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Kunne ikke skrive til datafil.']);
    exit;
}

echo json_encode(['ok' => true, 'id' => $id]);