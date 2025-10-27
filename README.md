<div align="center">

<img width="300" src="docs/Logo-light.png#gh-dark-mode-only">
<img width="300" src="docs/Logo.png#gh-light-mode-only">

<br>
<br>

[![Badge License]][License]

**EmulatorJS 中文优化版 - Node.js 服务器 + 完整中文化**

自托管的 **JavaScript** 多平台游戏模拟器

<br>

</div>

<br>

## ✨ 项目特性

本项目基于 [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) 进行了大幅改进：

### 🎯 核心功能
- ✅ **完整中文界面** - 所有菜单、设置项、核心选项全部汉化
- ✅ **Node.js 服务器** - 内置服务器支持，无需额外配置
- ✅ **用户认证系统** - 登录注册功能，支持多用户
- ✅ **云端存档** - 30 个存档槽位，自动保存到服务器
- ✅ **多 ROM 管理** - 支持 30+ 游戏平台，自动扫描游戏列表
- ✅ **游戏机筛选** - 按平台快速筛选游戏
- ✅ **移动端优化** - 响应式设计，支持触屏操作

### 🎮 支持的游戏平台

#### 任天堂 Nintendo
- NES（红白机）
- SNES（超级任天堂）
- N64（任天堂 64）
- NDS（任天堂 DS）
- GBA（Game Boy Advance）
- GB/GBC（Game Boy / Game Boy Color）
- Virtual Boy

#### 世嘉 Sega
- Mega Drive / Genesis
- Master System
- Game Gear
- Sega CD
- 32X
- Saturn

#### 索尼 Sony
- PlayStation 1
- PlayStation Portable

#### 雅达利 Atari
- Atari 2600、5200、7800
- Atari Lynx
- Atari Jaguar

#### Commodore
- Commodore 64、128
- Commodore Amiga
- Commodore VIC-20

#### 其他平台
- 街机 Arcade / MAME 2003
- 3DO
- ColecoVision

<br>

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
node server.js
```

服务器将在 `http://localhost:8080` 运行

### 添加游戏

1. 将 ROM 文件放入对应的 `roms/<平台名称>/` 文件夹
2. 例如：NES 游戏放入 `roms/nes/`，SNES 游戏放入 `roms/snes/`
3. 刷新页面，游戏将自动显示在列表中

<br>

## 📁 项目结构

```
EmulatorJSweb/
├── data/                          # EmulatorJS 核心文件
│   ├── localization/
│   │   └── zh-CN.json            # 完整中文翻译文件
│   ├── emulator.min.js           # 模拟器核心（需下载）
│   └── cores/                     # 模拟器核心（需下载）
├── roms/                          # ROM 文件目录
│   ├── nes/                       # NES 游戏
│   ├── snes/                      # SNES 游戏
│   ├── gba/                       # GBA 游戏
│   └── ...                        # 其他平台
├── saves/                         # 存档文件（自动生成）
├── api/                           # PHP API（可选）
├── index.html                     # 游戏列表页面
├── login.html                     # 登录页面
├── player.html                    # 游戏播放器页面
├── server.js                      # Node.js 服务器
└── package.json                   # 项目依赖
```

<br>

## 🌐 部署到服务器

1. 将整个项目文件夹上传到服务器
2. 安装依赖：`npm install`
3. 启动服务：`node server.js`
4. 使用 PM2 保持运行（推荐）：
   ```bash
   npm install -g pm2
   pm2 start server.js --name emulatorjs
   pm2 save
   pm2 startup
   ```

<br>

## 🎨 中文化说明

### 已完整翻译的内容

1. **界面菜单**
   - 图形设置、屏幕截图、速度选项
   - 输入选项、保存状态、后端核心选项

2. **FCE 核心选项**（30+ 选项）
   - 区域、金手指、宽高比、过扫描
   - 调色板、NTSC 滤镜、音频设置
   - 光枪模式、连发设置、超频等

3. **通用选项值**
   - 自动、禁用/启用、默认
   - 文件格式（PNG、JPG、MP4 等）
   - 分辨率（1x-4x）、旋转角度（0-270度）

### 翻译文件位置
- 主翻译文件：`data/localization/zh-CN.json`
- 强制翻译脚本：`player.html` 中的 JavaScript 代码

<br>

## 🔧 配置说明

### 修改端口

编辑 `server.js`：

```javascript
const PORT = 8080;  // 改为你想要的端口
```

### 添加新游戏平台

编辑 `server.js` 中的 `systems` 对象：

```javascript
const systems = {
    'system_id': {
        name: '平台名称',
        icon: '🎮',
        color: '#颜色代码',
        extensions: ['.扩展名', '.zip']
    }
};
```

<br>

## 📝 使用说明

### 快捷键

- **F1** - 打开菜单
- **F2** - 快速保存
- **F4** - 快速加载
- **F9** - 静音/取消静音
- **ESC** - 返回游戏列表

### 存档系统

- 支持 30 个存档槽位
- 每个槽位独立保存进度和截图
- 自动保存到服务器，多设备同步
- 支持手动选择存档/读档

<br>

## 🐛 常见问题

### Q: 游戏加载黑屏？
A: 检查 ROM 文件格式是否正确，确保放在对应的平台文件夹中

### Q: 中文没有显示？
A: 清空浏览器缓存（Ctrl+Shift+Delete），或使用无痕模式测试

### Q: 如何获取核心文件？
A: 从 [EmulatorJS Releases](https://github.com/EmulatorJS/EmulatorJS/releases) 下载，或使用 CDN

### Q: 可以在线访问吗？
A: 可以！部署到服务器后，通过域名或 IP 访问即可

<br>

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 参与翻译

如果发现翻译不准确，请编辑 `data/localization/zh-CN.json` 并提交 PR

### 报告问题

在 [Issues](https://github.com/qq1582185982/EmulatorJSweb/issues) 页面报告 Bug

<br>

## 📄 许可证

本项目基于 [GPL-3.0](LICENSE) 许可证开源

基于 [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) 项目

<br>

## 🙏 致谢

- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) - 原始项目
- [RetroArch](https://www.retroarch.com/) - 模拟器核心
- 所有贡献者和支持者

<br>

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by Claude Code

</div>

[License]: LICENSE
[Badge License]: https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge
