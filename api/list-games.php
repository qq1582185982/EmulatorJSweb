<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ROM文件目录
$romsDir = '../roms/';

// 支持的游戏机和文件扩展名
$systems = [
    'nes' => ['extensions' => ['nes', 'fds', 'unif'], 'name' => '任天堂 NES'],
    'snes' => ['extensions' => ['smc', 'sfc', 'fig'], 'name' => '超级任天堂'],
    'gba' => ['extensions' => ['gba'], 'name' => 'Game Boy Advance'],
    'gb' => ['extensions' => ['gb', 'gbc'], 'name' => 'Game Boy'],
    'n64' => ['extensions' => ['n64', 'z64'], 'name' => '任天堂 64'],
    'nds' => ['extensions' => ['nds'], 'name' => '任天堂 DS'],
    'psx' => ['extensions' => ['cue', 'bin', 'iso'], 'name' => 'PlayStation'],
    'segaMD' => ['extensions' => ['md', 'gen', 'smd'], 'name' => '世嘉MD'],
    'segaMS' => ['extensions' => ['sms'], 'name' => '世嘉Master System'],
    'pce' => ['extensions' => ['pce'], 'name' => 'PC Engine'],
];

$games = [];

// 扫描每个游戏机目录
foreach ($systems as $systemId => $systemInfo) {
    $systemPath = $romsDir . $systemId . '/';

    if (!is_dir($systemPath)) {
        continue;
    }

    $files = scandir($systemPath);

    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if (in_array($ext, $systemInfo['extensions'])) {
            $gameName = pathinfo($file, PATHINFO_FILENAME);

            // 尝试加载游戏信息（如果有metadata文件）
            $metadataFile = $systemPath . $gameName . '.json';
            $description = '经典游戏';

            if (file_exists($metadataFile)) {
                $metadata = json_decode(file_get_contents($metadataFile), true);
                if (isset($metadata['description'])) {
                    $description = $metadata['description'];
                }
            }

            $games[] = [
                'system' => $systemId,
                'name' => $gameName,
                'file' => $file,
                'description' => $description,
                'size' => filesize($systemPath . $file)
            ];
        }
    }
}

echo json_encode($games, JSON_UNESCAPED_UNICODE);
?>
