# 测试 1：花叔文档审稿专家（合同审查模式）

复跑方法：
```bash
python3 make_contract.py                               # 生成预埋 6 个问题的测试合同
python3 inject_review.py contract.docx decisions.json  # 写入批注和修订
```

- `decisions.json`：按专家要求，模型只输出结构化决策（P1–P6 对应预埋问题，P7 是故意构造的失配项）
- `inject_review.py`：按专家描述的三层保护实现（Schema 校验 → 字符串精确匹配 → 单条失败隔离）

| 检查项 | 结果 |
|---|---|
| 预埋问题命中 | 6/6 |
| 批注 / 修订 | 5 条批注，5 处修订（w:ins + w:del） |
| 失配隔离 | P7 记录为 SKIP-nomatch，其他条目不受影响 |
| 原文件 | 未被改动，输出为 contract.reviewed.docx |
| 兼容性 | python-docx、LibreOffice 都能打开；截图见 preview-1.png |

发现的问题：
1. 专家包里只有提示词，没有脚本。上面这约 110 行注入代码需要宿主模型每次现场写，换成弱模型风险很高。
2. 按段落定位的设计没法表达“缺失条款”（例如本合同没有知识产权、验收条款）。
