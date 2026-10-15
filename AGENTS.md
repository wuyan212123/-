# AGENTS.md · 给编码代理的规则

本仓库的主体是 `inventory-workbench/`：进销存协作工作台的前端原型（单文件、无框架、虚构演示数据）。后续任务是在新工程里**一比一还原**它，再接入真实数据与后端。

## 先读

1. `inventory-workbench/docs/dev/00-开发总览.md`：范围、原则、完成标准、文档索引
2. `inventory-workbench/docs/dev/08-开发任务清单.md`：按阶段执行的任务
3. 做到哪一块，再读对应的 01–07 文档

## 硬性规则

1. **原型就是规格。** 文档与原型不一致时，以原型行为为准，并在 PR 中指出文档需更正。原型源码在 `inventory-workbench/src/`，构建：`python3 inventory-workbench/tools/build.py`。
2. **样式不改。** 原样复用 `inventory-workbench/src/styles.css`；DOM 结构、类名、`id`、`role`、`aria-*`、`data-*` 与原型一致；不用 UI 组件库、Tailwind、CSS-in-JS。
3. **文案逐字一致。** 包括全角标点、“·”、“—”、“→”和空格。
4. **不补造业务公式。** 只有 US 的 `J=HT/I`、`HX=(HS+HT)/(HO/7)` 有证据；其余显示源值或“待接入”。可撑天数、库存推演、预计到仓日是演示估算，必须保留“演示估算，非原公式”标注。待确认事项见 `inventory-workbench/docs/04-待确认项.md`，没有结论的不实现。
5. **缺失值不混用。** 未提供 / 无字段 / 未发生 / 空白 / 待接入 / 真实 0 分开显示，不把缺失写成 0。
6. **演示数据完全一致。** 第一阶段移植 `src/data.js` 生成器，种子与调用顺序不变，否则视觉对比无法通过。
7. **不联系外部服务、不上传真实业务文件、不写生产数据。**
8. **测试钩子。** 新实现提供 `window.wbTest`，状态 ID 与 `inventory-workbench/src/app-test.js` 一致。

## 每个 PR 必须通过

```bash
cd inventory-workbench
node tools/visual.cjs compare <新实现URL> --only <本PR涉及的状态ID>   # 每个状态 × 3 变体 ≤ 0.5% 不同像素
node tools/a11y.cjs                                                    # 原型基线 0 违规；新实现也须 0 违规
node tools/perf.cjs 25                                                 # 不超过 07 文档的预算
```

另外：与本 PR 相关的行为检查（编号见 `docs/03-功能覆盖与验证记录.md` 第 4 节）已改写为新工程的 Playwright 测试并通过。

## 提交规范

- 一个任务一个 PR；PR 描述列出状态 ID、行为检查编号和视觉对比结果。
- 不修改原型（`inventory-workbench/src/`、`tools/`）。需要新增界面状态时，先在原型 `app-test.js` 加状态，并在 PR 中说明。
