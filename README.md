# 熊猫情绪重启计划（panda-emotional-reset）

21 天生活重启计划：和一只温柔的熊猫一起，把生活慢慢找回来。

一款**中文心理健康自助辅助软件**，从饮食、运动、阅读、睡眠、人际关系、情绪记录、正念、自我同情、CBT 思维记录、行为激活等方面，为用户每天生成循序渐进的小计划。整体 UI 为温暖的“熊猫治愈风”，纯 CSS 绘制熊猫，无外部图片资源。

---

## ⚠️ 医疗免责声明

**本软件仅用于心理健康自助支持，不提供医学诊断，不替代心理咨询、精神科治疗或药物治疗。如你有伤害自己或结束生命的想法，请立即联系身边可信任的人、当地急救电话、医院急诊或专业危机干预热线。**

- 本软件**不是**医疗软件，不做诊断，不承诺任何治疗效果。
- 当用户在评估或反馈中表达出伤害自己的风险时，软件会立即显示醒目的危机安全提示，并给出求助渠道（当地急救电话 120、全国统一心理援助热线 12356 等）。

---

## 功能列表

| 页面 | 说明 |
| --- | --- |
| 激活页 | 首次启动需输入专属识别码（本地模拟验证，可扩展为服务器验证） |
| 欢迎页 | 熊猫 Mascot、免责声明、危机提醒、开始计划 / 查看内容库 |
| 初始评估 | 心情、精力、睡眠、食欲、社交支持、习惯偏好、困难多选、安全评估 |
| 今日计划 | 第 X/21 天、稳定期/激活期/重建期、3-5 个任务卡片（完成/跳过/太难了） |
| 每日反馈 | 情绪精力、任务完成情况、困难、自我肯定、安全提醒问题 |
| 进度页 | 完成天数、完成率、连续天数、情绪/精力分数、自我肯定记录 |
| 内容库 | 10 个模块：行为激活、睡眠卫生、温和饮食、轻运动、CBT 思维记录、正念呼吸、自我同情、人际连接、何时寻求专业帮助、危机帮助提示 |
| 设置页 | 激活状态、免责声明、导出 JSON、清除数据、重置计划、版本号、隐私说明 |

## 技术栈

- **Electron 31**（桌面壳）
- **React 18 + TypeScript 5**（渲染层）
- **Vite 5 + vite-plugin-electron**（构建与开发热更新）
- **React Router 6**（HashRouter，适配 Electron 文件加载）
- **localStorage**（MVP 本地数据存储，无后端、无外部 API）
- **electron-builder**（打包 Windows NSIS 安装包）

不接入任何外部 AI API，不需要付费服务，不依赖服务器。

## 环境要求

- Node.js 18+（推荐 20+）
- npm
- Windows（打包 exe 建议在 Windows 上进行）

## 安装依赖

```bash
npm install
```

> 项目自带 `.npmrc` 配置了国内镜像（npmmirror），用于加速 Electron 二进制的下载；如不需要可直接删除该文件。

## 开发运行

```bash
npm run dev
```

Vite 启动后会自动打开 Electron 窗口（1100×760，标题“熊猫情绪重启计划”），代码修改后热更新。

## 打包 Windows exe

```bash
npm run dist
```

该命令会先执行类型检查与构建（`tsc --noEmit && vite build`），再用 electron-builder 打包。完成后：

- 安装包：`release/PandaEmotionalReset-Setup-1.0.0.exe`
- 目录说明：`dist/`（渲染层构建产物）、`dist-electron/`（主进程构建产物）、`release/`（安装包输出）

> 在非 Windows 系统上也保留了 Windows 打包配置（`package.json` 的 `build.win`），在 Windows 上执行 `npm run dist` 即可直接出 exe。

### 常见打包问题：winCodeSign 符号链接报错

如果打包时报错 `Cannot create symbolic link … winCodeSign\…\libssl.dylib`，原因是当前 Windows 未开启「开发者模式」，解压 winCodeSign 工具包时无法创建符号链接（失败的都是 macOS 文件，Windows 打包用不到）。两种解决办法：

1. **开启开发者模式（推荐，一次解决）**：Windows 设置 → 隐私和安全性 → 开发者选项 → 打开「开发人员模式」；
2. **手动预置缓存**：执行以下命令后重新 `npm run dist`：

```bash
cd "$LOCALAPPDATA/electron-builder/Cache/winCodeSign"
curl -sL -o wcs.7z "https://npmmirror.com/mirrors/electron-builder-binaries/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
mkdir -p _x
"$(pwd)/../../../../panda_emotional_reset/node_modules/7zip-bin/win/x64/7za.exe" x -snl- -y -o_x wcs.7z
cp -r _x winCodeSign-2.6.0
rm -rf _x wcs.7z
```

其中 `7za.exe` 的路径替换为你项目里 `node_modules/7zip-bin/win/x64/7za.exe` 的实际路径（`-snl-` 表示跳过符号链接）。

其他脚本：

```bash
npm run build    # 仅类型检查 + 构建，不打包
npm run preview  # 浏览器预览渲染层
```

## 测试激活码

当前为**本地模拟激活码**，以下三个码可以直接通过：

| 激活码 | 用途 |
| --- | --- |
| `PANDA-RESET-2025` | 演示激活 |
| `PANDA-21DAY-DEMO` | 演示激活 |
| `TEST-PANDA-0001` | 演示激活 |

激活成功后状态保存在本机 localStorage，下次打开无需重复激活。设置页可查看激活状态，并可“解除激活”（仅开发调试用）。

### 生成更多识别码

```bash
npm run generate:licenses              # 默认生成 20 个
npm run generate:licenses -- --count 50
```

生成类似 `PANDA-XXXX-XXXX-XXXX` 的识别码，输出到 `licenses/generated-license-codes.csv`。这些码默认**不**在本地白名单中（本地白名单见 `src/services/licenseService.ts`），主要用于将来服务器验证或线下发放。

## 数据隐私说明

当前版本中，你的评估、反馈和计划数据默认只保存在本机 localStorage，不会自动上传。设置页可以导出全部本地数据为 JSON 文件备份。

## 激活码系统：如何替换为真实服务器验证

激活逻辑集中在 [src/services/licenseService.ts](src/services/licenseService.ts)，采用 Provider 模式：

1. 当前使用 `localProvider`：校验本地白名单，激活成功后写入 localStorage；
2. 文件中已预留 `remoteProvider` 的实现位置（HTTP 请求 + 校验 + 错误处理）和注释说明；
3. 页面层只依赖 `activateLicense` / `checkActivationStatus` / `deactivateForDev` 三个函数。

**替换步骤（正式售卖前）：**

1. 部署激活码校验服务器（校验签名、绑定设备、防重放、防离线绕过）；
2. 在 `licenseService.ts` 中实现 `remoteProvider`（调用你的服务器 API，激活成功后以 `mode: 'server'` 保存）；
3. 把 `provider` 指向 `remoteProvider`；
4. 建议增加定期复核（例如每 7 天向服务器复核激活有效性）。

> ⚠️ 正式售卖前必须接入服务器激活验证，否则本地白名单可被轻易绕过。

## 项目结构

```
panda_emotional_reset/
├── electron/                 # Electron 主进程与 preload
│   ├── main.ts               # 窗口创建（1100×760，标题“熊猫情绪重启计划”）
│   └── preload.ts            # contextBridge 暴露版本信息
├── scripts/
│   ├── generateLicenseCodes.ts  # 生成 PANDA-XXXX-XXXX-XXXX 识别码并输出 CSV
│   └── generateIcon.ts          # 纯代码生成熊猫图标 build/icon.ico
├── src/
│   ├── types/                # user / plan / license / feedback 类型定义
│   ├── services/
│   │   ├── storageService.ts # localStorage 读写（档案/反馈/进度/激活/任务状态）
│   │   ├── licenseService.ts # 激活码验证（Provider 模式，可替换为服务器）
│   │   ├── planEngine.ts     # 每日计划生成引擎（阶段任务池 + 难度动态调整）
│   │   └── safetyService.ts  # 风险评估、危机提示、风险文本检测
│   ├── components/           # PandaMascot / AppLayout / Card / Button / SliderInput
│   │                         # TaskItem / CrisisNotice / ProgressBar / NavBar / CompletionCelebration
│   ├── pages/                # 8 个页面（激活/欢迎/评估/今日/反馈/进度/内容库/设置）
│   ├── styles/               # global.css / components.css / pages.css
│   ├── App.tsx               # 路由与启动跳转逻辑
│   └── config.ts             # 应用名称、版本、免责声明等文案
├── build/icon.ico            # 应用图标（由 npm run generate:icon 生成）
└── package.json              # 脚本与 electron-builder 配置
```

## 如何上传 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin 仓库地址
git push -u origin main
```

把 `仓库地址` 换成你自己的（例如 `git@github.com:你的用户名/panda-emotional-reset.git` 或 https 链接）。

## 上线前注意事项

1. **接入服务器激活验证**（见上文）；
2. 如需替换应用图标：修改 `scripts/generateIcon.ts` 后运行 `npm run generate:icon`，或直接把你的 `icon.ico` 放到 `build/` 目录；
3. 正式发布建议购买代码签名证书（否则安装时可能出现“未知发布者”提示）；
4. 内容库文案建议请心理专业人士审阅后再发布。

---

*熊猫陪你慢慢来，今天只走一小步。*
