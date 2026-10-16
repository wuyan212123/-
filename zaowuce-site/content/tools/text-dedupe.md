---
id: text-dedupe
name: 文本去重整理
aliases: [去重, 文本整理]
summary: 按行去掉首尾空白和空行，删除重复项，保留第一次出现的顺序。
scene: 轻量整理
run_mode: browser
maturity: formal
platforms: [浏览器]
output: 整理后的文本
data_location: 文本只在当前浏览器中处理，不会上传，也不会保存。
widget: dedupe
owner: 站主
order: 10
updated: 2026-10-16
---
## 处理规则

1. 每一行去掉开头和结尾的空格。
2. 删除空行。
3. 完全相同的行只保留第一次出现的那一行，顺序不变。

大小写不同视为不同的行，例如 `Bottle` 和 `bottle` 都会保留。
