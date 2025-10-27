const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'EmulatorJS 游戏中心',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        icon: path.join(__dirname, 'icon.ico'),
        autoHideMenuBar: true
    });

    // 加载游戏列表页面
    mainWindow.loadFile('index-static.html');

    // 创建菜单
    createMenu();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 创建应用菜单
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '打开ROM文件夹',
                    click: openRomsFolder
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: 'Alt+F4',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: '查看',
            submenu: [
                {
                    label: '刷新',
                    accelerator: 'F5',
                    click: () => mainWindow.reload()
                },
                {
                    label: '全屏',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => mainWindow.webContents.toggleDevTools()
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '使用说明',
                    click: showHelp
                },
                {
                    label: '关于',
                    click: showAbout
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 打开ROM文件夹
function openRomsFolder() {
    const romsPath = path.join(__dirname, 'roms');

    // 确保文件夹存在
    if (!fs.existsSync(romsPath)) {
        fs.mkdirSync(romsPath, { recursive: true });
    }

    require('electron').shell.openPath(romsPath);
}

// 显示帮助
function showHelp() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '使用说明',
        message: 'EmulatorJS 使用指南',
        detail: `
1. 添加游戏：
   点击"文件 > 打开ROM文件夹"，将ROM文件放入对应的游戏机文件夹

2. 支持的游戏机：
   - NES (任天堂红白机)
   - SNES (超级任天堂)
   - GBA (Game Boy Advance)
   - GB (Game Boy)
   - N64 (任天堂64)
   - PSX (PlayStation)
   等等...

3. 游戏操作：
   - F1: 打开菜单
   - F2: 快速保存
   - F4: 快速加载
   - F9: 静音/取消静音
   - ESC: 返回游戏列表

4. 存档位置：
   存档保存在应用数据目录中

更多帮助请访问: https://emulatorjs.org
        `,
        buttons: ['确定']
    });
}

// 显示关于
function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '关于',
        message: 'EmulatorJS 游戏中心',
        detail: `
版本: 1.0.0
基于: EmulatorJS 4.x

EmulatorJS 是一个开源的Web游戏模拟器
支持多种经典游戏平台

项目地址: https://github.com/EmulatorJS/EmulatorJS
许可证: GPL-3.0
        `,
        buttons: ['确定']
    });
}

// 应用准备就绪
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 所有窗口关闭时退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
});
