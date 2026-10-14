# 进销存协作工作台 · 前端方案（演示版）

可交互前端原型：国家进销存主表、SKU 统一详情、运营人员视图、全局搜索、总销量、库存汇总、发货计划、数据更新/异常、原表覆盖与验收。界面为简体中文，Apple 式浅色/深色桌面风格。

> **全部数据为纯虚构演示数据**（SKU 前缀 `DEMO-`、ASIN 前缀 `B0DEMO`、人员“运营甲/乙/丙/丁”）。保存、导入、协作、权限都只在本页内存中模拟，刷新即重置；没有连接任何后端或外部服务。

## 打开

直接用浏览器打开 `index.html`（单文件，无需安装或联网）。

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` | 构建产物：可直接打开的完整页面 |
| `dist/workbench.html` | 构建产物：发布为 Artifact 用的页面片段 |
| `src/data.js` | 固定种子生成的虚构数据；国家覆盖差异、源列位置、边界案例 |
| `src/app-core.js` | 共享状态、渲染工具、外壳、导航 |
| `src/app-country.js` | 国家主表 8 个视图、月矩阵、周范围、半月计划、批次 |
| `src/app-detail.js` | SKU 统一详情 7 个分区 |
| `src/app-pages.js` | 人员、搜索、总销量、库存汇总、发货计划、更新、覆盖、说明 |
| `src/app-main.js` | 事件、保存/冲突模拟、全局搜索浮层、启动 |
| `tools/build.py` | 内联生成 `index.html` 与 `dist/workbench.html` |
| `tools/verify.cjs` | Playwright 交互验证与截图（95 项） |
| `docs/` | 设计说明、状态说明、覆盖与验证记录、待确认项、截图 |

## 构建与验证

```bash
python3 tools/build.py            # 修改 src/ 后重新生成
node tools/verify.cjs             # 需要 playwright；截图与 results.json 写入 docs/screenshots
```

## 文档

1. [设计说明](docs/01-设计说明.md)（一页）
2. [状态说明：真实交互与设计占位](docs/02-状态说明.md)
3. [功能覆盖与验证记录](docs/03-功能覆盖与验证记录.md)
4. [待确认项](docs/04-待确认项.md)
