<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 读取POST数据
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['userId']) || !isset($data['system']) || !isset($data['romFile']) || !isset($data['saveData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

$userId = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['userId']);
$system = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['system']);
$romFile = basename($data['romFile']);
$saveData = $data['saveData'];

// 创建保存目录
$saveDir = '../saves/' . $userId . '/' . $system . '/';
if (!file_exists($saveDir)) {
    mkdir($saveDir, 0755, true);
}

// 保存文件名
$saveName = pathinfo($romFile, PATHINFO_FILENAME);
$saveFile = $saveDir . $saveName . '.json';

// 保存数据
$saveContent = json_encode([
    'timestamp' => time(),
    'system' => $system,
    'romFile' => $romFile,
    'saveData' => $saveData
], JSON_UNESCAPED_UNICODE);

if (file_put_contents($saveFile, $saveContent)) {
    echo json_encode([
        'success' => true,
        'message' => 'Save state saved successfully',
        'timestamp' => time()
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save state']);
}
?>
