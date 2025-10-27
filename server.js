const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 8080;
const SAVES_DIR = './saves';
const USERS_FILE = './users.json';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.nes': 'application/octet-stream',
    '.sfc': 'application/octet-stream',
    '.gba': 'application/octet-stream',
    '.zip': 'application/zip'
};

// 确保存档目录和用户文件存在
if (!fs.existsSync(SAVES_DIR)) {
    fs.mkdirSync(SAVES_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

// 用户管理函数
function loadUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateUserId(username) {
    return 'user_' + crypto.createHash('md5').update(username + Date.now()).digest('hex');
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // API路由处理
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname, parsedUrl);
        return;
    }

    // 静态文件处理
    let filePath = '.' + pathname;

    // 默认页面
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('服务器错误: ' + error.code, 'utf-8');
            }
        } else {
            // CORS headers for EmulatorJS
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp'
            });
            res.end(content, 'utf-8');
        }
    });
});

// API处理函数
function handleAPI(req, res, pathname, parsedUrl) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 获取游戏列表
    if (pathname === '/api/list-games' && req.method === 'GET') {
        listGames(req, res);
    }
    // 保存存档
    else if (pathname === '/api/save-state' && req.method === 'POST') {
        saveState(req, res);
    }
    // 加载存档
    else if (pathname === '/api/load-state' && req.method === 'GET') {
        loadState(req, res, parsedUrl);
    }
    // 批量查询存档槽
    else if (pathname === '/api/list-slots' && req.method === 'GET') {
        listSlots(req, res, parsedUrl);
    }
    // 用户注册
    else if (pathname === '/api/register' && req.method === 'POST') {
        registerUser(req, res);
    }
    // 用户登录
    else if (pathname === '/api/login' && req.method === 'POST') {
        loginUser(req, res);
    }
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API not found' }));
    }
}

// 列出游戏
function listGames(req, res) {
    const romsDir = './roms';
    const systems = {
        // Nintendo
        'nes': { name: '任天堂 NES', icon: '🎮', color: '#E60012', extensions: ['.nes', '.zip'] },
        'snes': { name: '超级任天堂 SNES', icon: '🎮', color: '#0070CC', extensions: ['.sfc', '.smc', '.zip'] },
        'n64': { name: '任天堂64', icon: '🎮', color: '#00BCF2', extensions: ['.n64', '.z64', '.v64', '.zip'] },
        'nds': { name: '任天堂 DS', icon: '🎮', color: '#D12228', extensions: ['.nds', '.zip'] },
        'gba': { name: 'Game Boy Advance', icon: '🎮', color: '#5E317C', extensions: ['.gba', '.zip'] },
        'gb': { name: 'Game Boy', icon: '🎮', color: '#8B8B8B', extensions: ['.gb', '.gbc', '.zip'] },
        'vb': { name: 'Virtual Boy', icon: '🎮', color: '#FF0000', extensions: ['.vb', '.zip'] },

        // Sega
        'segaMD': { name: '世嘉MD', icon: '🎮', color: '#0089CF', extensions: ['.md', '.bin', '.gen', '.zip'] },
        'segaMS': { name: '世嘉Master System', icon: '🎮', color: '#FF6B00', extensions: ['.sms', '.zip'] },
        'segaGG': { name: '世嘉Game Gear', icon: '🎮', color: '#4B0082', extensions: ['.gg', '.zip'] },
        'segaCD': { name: '世嘉CD', icon: '🎮', color: '#0089CF', extensions: ['.bin', '.cue', '.iso', '.zip'] },
        'sega32x': { name: '世嘉32X', icon: '🎮', color: '#1E90FF', extensions: ['.32x', '.bin', '.zip'] },
        'segaSaturn': { name: '世嘉Saturn', icon: '🎮', color: '#4169E1', extensions: ['.bin', '.cue', '.iso', '.zip'] },

        // Sony
        'psx': { name: 'PlayStation', icon: '🎮', color: '#003791', extensions: ['.iso', '.bin', '.cue', '.zip'] },
        'psp': { name: 'PlayStation Portable', icon: '🎮', color: '#0070D1', extensions: ['.iso', '.cso', '.zip'] },

        // Atari
        'atari2600': { name: 'Atari 2600', icon: '🎮', color: '#D84F2C', extensions: ['.a26', '.bin', '.zip'] },
        'atari5200': { name: 'Atari 5200', icon: '🎮', color: '#FF6347', extensions: ['.a52', '.bin', '.zip'] },
        'atari7800': { name: 'Atari 7800', icon: '🎮', color: '#CD5C5C', extensions: ['.a78', '.bin', '.zip'] },
        'lynx': { name: 'Atari Lynx', icon: '🎮', color: '#FF8C00', extensions: ['.lnx', '.zip'] },
        'jaguar': { name: 'Atari Jaguar', icon: '🎮', color: '#DC143C', extensions: ['.j64', '.jag', '.zip'] },

        // Commodore
        'c64': { name: 'Commodore 64', icon: '💻', color: '#8B4513', extensions: ['.d64', '.t64', '.prg', '.zip'] },
        'c128': { name: 'Commodore 128', icon: '💻', color: '#A0522D', extensions: ['.d64', '.t64', '.prg', '.zip'] },
        'amiga': { name: 'Commodore Amiga', icon: '💻', color: '#CD853F', extensions: ['.adf', '.adz', '.dms', '.zip'] },
        'vic20': { name: 'Commodore VIC-20', icon: '💻', color: '#D2691E', extensions: ['.prg', '.zip'] },

        // Other
        'arcade': { name: '街机 Arcade', icon: '🕹️', color: '#FFD700', extensions: ['.zip'] },
        'mame2003': { name: 'MAME 2003', icon: '🕹️', color: '#FFA500', extensions: ['.zip'] },
        '3do': { name: '3DO', icon: '🎮', color: '#9370DB', extensions: ['.iso', '.bin', '.cue', '.zip'] },
        'coleco': { name: 'ColecoVision', icon: '🎮', color: '#4682B4', extensions: ['.col', '.zip'] }
    };

    const result = [];

    for (const [systemId, systemInfo] of Object.entries(systems)) {
        const systemPath = path.join(romsDir, systemId);

        if (!fs.existsSync(systemPath)) continue;

        const games = [];
        const files = fs.readdirSync(systemPath);

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (systemInfo.extensions.includes(ext)) {
                games.push({
                    name: path.basename(file, ext),
                    file: file,
                    desc: ''
                });
            }
        });

        if (games.length > 0) {
            result.push({
                system: systemId,
                systemName: systemInfo.name,
                icon: systemInfo.icon,
                color: systemInfo.color,
                games: games
            });
        }
    }

    res.writeHead(200);
    res.end(JSON.stringify(result));
}

// 保存存档
function saveState(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { userId = 'default', system, gameName, state } = data;

            const userDir = path.join(SAVES_DIR, userId, system);
            fs.mkdirSync(userDir, { recursive: true });

            const saveFile = path.join(userDir, `${gameName}.json`);
            fs.writeFileSync(saveFile, JSON.stringify(state));

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: '存档保存成功' }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
}

// 加载存档
function loadState(req, res, parsedUrl) {
    const userId = parsedUrl.searchParams.get('userId') || 'default';
    const system = parsedUrl.searchParams.get('system');
    const gameName = parsedUrl.searchParams.get('gameName');

    if (!system || !gameName) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
    }

    const saveFile = path.join(SAVES_DIR, userId, system, `${gameName}.json`);

    if (!fs.existsSync(saveFile)) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Save not found' }));
        return;
    }

    try {
        const state = JSON.parse(fs.readFileSync(saveFile, 'utf-8'));
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, state: state }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// 批量查询存档槽
function listSlots(req, res, parsedUrl) {
    const userId = parsedUrl.searchParams.get('userId') || 'default';
    const system = parsedUrl.searchParams.get('system');
    const gameName = parsedUrl.searchParams.get('gameName');
    const maxSlots = parseInt(parsedUrl.searchParams.get('maxSlots')) || 30;

    if (!system || !gameName) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
    }

    const slots = [];
    for (let i = 1; i <= maxSlots; i++) {
        const saveFile = path.join(SAVES_DIR, userId, system, `${gameName}_slot${i}.json`);

        if (fs.existsSync(saveFile)) {
            try {
                const state = JSON.parse(fs.readFileSync(saveFile, 'utf-8'));
                slots.push({
                    number: i,
                    hasSave: true,
                    info: state
                });
            } catch (error) {
                slots.push({ number: i, hasSave: false, info: null });
            }
        } else {
            slots.push({ number: i, hasSave: false, info: null });
        }
    }

    res.writeHead(200);
    res.end(JSON.stringify({ success: true, slots: slots }));
}

// 用户注册
function registerUser(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);

            if (!username || !password || username.length < 3 || password.length < 6) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: '用户名至少3个字符，密码至少6个字符' }));
                return;
            }

            const users = loadUsers();

            if (users[username]) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: '用户名已存在' }));
                return;
            }

            const userId = generateUserId(username);
            users[username] = {
                userId: userId,
                password: hashPassword(password),
                createdAt: Date.now()
            };

            saveUsers(users);

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, userId: userId, message: '注册成功' }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, message: error.message }));
        }
    });
}

// 用户登录
function loginUser(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);

            if (!username || !password) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: '用户名和密码不能为空' }));
                return;
            }

            const users = loadUsers();
            const user = users[username];

            if (!user || user.password !== hashPassword(password)) {
                res.writeHead(401);
                res.end(JSON.stringify({ success: false, message: '用户名或密码错误' }));
                return;
            }

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, userId: user.userId, message: '登录成功' }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, message: error.message }));
        }
    });
}

server.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🎮 EmulatorJS 本地服务器已启动');
    console.log('========================================');
    console.log(`\n访问地址: http://localhost:${PORT}`);
    console.log('\n按 Ctrl+C 停止服务器\n');
    console.log('========================================\n');
});
