<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = isset($_GET['userId']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['userId']) : '';
$system = isset($_GET['system']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['system']) : '';
$romFile = isset($_GET['romFile']) ? basename($_GET['romFile']) : '';

if (!$userId || !$system || !$romFile) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

// 保存文件路径
$saveName = pathinfo($romFile, PATHINFO_FILENAME);
$saveFile = '../saves/' . $userId . '/' . $system . '/' . $saveName . '.json';

if (file_exists($saveFile)) {
    $saveContent = file_get_contents($saveFile);
    $saveObj = json_decode($saveContent, true);

    echo json_encode([
        'success' => true,
        'saveData' => $saveObj['saveData'],
        'timestamp' => $saveObj['timestamp']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No save state found'
    ]);
}
?>
