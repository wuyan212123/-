# 进销存协作工作台 · 前端方案（演示版）

可交互的前端原型，包含：国家进销存主表、SKU 统一详情、运营人员视图、全局搜索、总销量、库存汇总、发货计划、数据更新/异常、版本记录，以及原表覆盖与验收。界面为简体中文，采用 macOS 系统风格（毛玻璃侧栏、统一工具栏、Finder 式列表、底部状态栏），支持浅色和深色。

> **全部数据为纯虚构的演示数据**：虚构的美术用品，SKU 前缀 `DEMO-`，ASIN 前缀 `B0DEMO`，人员为“运营甲/乙/丙/丁”。保存、导入、协作、权限都只在本页内存中模拟，刷新即重置；没有连接任何后端或外部服务。

## 打开

直接用浏览器打开 `index.html`（单文件，无需安装，也不用联网）。

在地址后加 `?scale=N`（1—40）可以把演示数据放大 N 倍，用来查看真实数据量下的分页和性能，例如 `index.html?scale=25` 约有 550 个 SKU、2,600 条 Listing。默认 `scale=1`。

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` | 构建产物，可直接打开的完整页面 |
| `dist/workbench.html` | 构建产物，发布为 Artifact 用的页面片段 |
| `src/styles.css` | 样式令牌（浅色/深色两套，对比度已校验）与组件样式 |
| `src/shell.html` | 窗口外壳：侧栏、工具栏、底部来源条 |
| `src/data.js` | 用固定种子生成的虚构数据，包括国家覆盖差异、源列位置和边界案例；支持 `?scale=N` |
| `src/app-core.js` | 共享状态、索引、渲染工具（表格、分页、焦点恢复、弹层）和导航 |
| `src/app-country.js` | 国家主表的 8 个视图，以及月矩阵、年份选择、周范围、半月计划和批次清单 |
| `src/app-viz.js` | 趋势小图、逐年同月对比图、色阶 |
| `src/app-cover.js` | 可撑天数模型（演示估算）、断货风险条、库存推演图、批次时间线、库龄构成条 |
| `src/app-cols.js` | 列目录（按国家判断适用性）与列配置弹层（分组、排序、固定列、模版） |
| `src/app-detail.js` | SKU 统一详情的 7 个分区 |
| `src/app-pages.js` | 人员、搜索、总销量、库存汇总、发货计划、更新、版本记录、覆盖、说明 |
| `src/app-main.js` | 事件处理、保存/冲突模拟、全局搜索浮层、启动 |
| `src/app-test.js` | 测试钩子 `window.wbTest`：37 个界面状态，供一比一视觉对比 |
| `tools/build.py` | 内联生成 `index.html` 与 `dist/workbench.html` |
| `tools/verify.cjs` | Playwright 交互验证与截图（143 项） |
| `tools/perf.cjs` | 按真实规模测量各页面的渲染耗时 |
| `tools/visual.cjs` | 视觉逐像素对比：原型与新实现在同一浏览器里按同一状态截图对比 |
| `tools/a11y.cjs` | axe-core 无障碍扫描（24 个页面/弹层，浅色和深色各一次） |
| `docs/` | 设计说明、状态说明、覆盖与验证记录、待确认项、开发前检查报告、截图 |
| `docs/dev/` | **正式开发文档**（给 Codex 等编码代理）：架构、设计系统、页面规格、数据与规则、接口契约、状态与交互、验收、任务清单；`baseline/` 为参照截图 |

## 构建与验证

```bash
python3 tools/build.py            # 修改 src/ 后重新生成
node tools/verify.cjs             # 需要 playwright；截图与 results.json 写入 docs/screenshots
node tools/perf.cjs 25            # 真实规模性能，结果写入 docs/screenshots/perf.json
npm i axe-core && node tools/a11y.cjs   # 无障碍扫描，结果写入 docs/screenshots/a11y.json
node tools/visual.cjs compare <URL>     # 与新实现逐像素对比，报告写入 docs/dev/visual-report/
```

`a11y.cjs` 也可以直接接收 `axe.min.js` 的路径作为参数。

## 文档

1. [设计说明](docs/01-设计说明.md)（一页）
2. [状态说明：真实交互与设计占位](docs/02-状态说明.md)
3. [功能覆盖与验证记录](docs/03-功能覆盖与验证记录.md)
4. [待确认项](docs/04-待确认项.md)
5. [开发前检查报告](docs/05-开发前检查报告.md)
6. [正式开发文档](docs/dev/00-开发总览.md)（入口；仓库根目录另有 `AGENTS.md`）
