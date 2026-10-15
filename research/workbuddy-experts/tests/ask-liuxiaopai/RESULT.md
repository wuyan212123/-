# 测试 2：AI 刘小排（按包内 voice-tests rubric 回归）

- 包内只跑过 T1（8 题中的 1 题）。本次补跑 T2（B2B）和 T6（定价）。
- `T2-output.md` / `T6-output.md`：严格按 SKILL.md 和对应的 methodology 作答
- `judge.py`：把 rubric 里能机械判断的 7 条（r3/r4/r7/r10/r12/r13/r14）写成脚本

```bash
python3 judge.py T2-output.md T6-output.md
```

| 题 | 机械项 | 语义项（人工） |
|---|---|---|
| T2 | 7/7 PASS | r1 表态（B 砍小）✅ r2 要求具体人名 ✅ r8 触发 4 角色 ✅ r11 引用方法论 ✅ |
| T6 | 7/7 PASS | 低价订阅陷阱 ✅ 先一次性付费验证 ✅ 购买理由四维度 ✅；“不直接给定价数字”只部分满足（给了 19.9 元作为验证价）⚠️ |

偏差说明：作答和判分是同一个模型，结果为上限估计。包内 T1 的原始记录（GPT-5.5 作答 + 独立 judge，12 pass / 0 fail）可以作为第三方参照。
