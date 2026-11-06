# 开品维度图谱 × 选品地图联动（前端）

本目录是 `wuyan212123/meeden-product-atlas` 的改动补丁（本会话对该仓库只有读取权限，不能直接推送）。

- `开品维度图谱接入选品地图.patch`：基于 meeden-product-atlas `6601289`（归档 MEEDEN 第三批 A/C 针管笔和马克笔属性补全）的五个提交（接入思维导图；离线快照同样内联；导图下方的品类工作台；《开品维度图谱规范》与自动校验；数据结构说明）。
- `给Codex的任务说明_开品维度图谱扩展.md`：发给 Codex 的任务说明（按规范扩展全部品类）；`Codex任务包_开品维度图谱扩展.zip` 是打包好的发送文件。
- `接入说明.md`：改了什么、数据放在哪里、已检查和待办（同补丁里的 `docs/开品维度图谱接入说明.md`）。
- `截图/`：本地运行截图。

## 应用

```bash
cd meeden-product-atlas
git checkout -b claude/dimension-atlas-link
git am /path/to/开品维度图谱接入选品地图.patch
python3 selection_map/build_dimension_data.py   # 可选：重新生成 web/dimension-data.js（补丁里已带）
python3 selection_map/launch.py                 # 或双击 启动选品地图.command
```

在思维导图里打开 耗材 › 本册纸张，点 **水彩纸**，下一级就是 ① 在售类型 / ② 分类维度 / ③ 开品机会 / ④ 白地图；C088 等地图形态挂在对应的在售类型下。
