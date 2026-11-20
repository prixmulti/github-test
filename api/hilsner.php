<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$jsonPath = dirname(__DIR__) . '/data/hilsner.json';

if (!is_file($jsonPath)) {
    echo json_encode([]);
    exit;
}

$decoded = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($decoded)) {
    echo json_encode([]);
    exit;
}

usort($decoded, static function (array $a, array $b): int {
    return strcmp((string) ($b['created'] ?? ''), (string) ($a['created'] ?? ''));
});

echo json_encode($decoded, JSON_UNESCAPED_UNICODE);