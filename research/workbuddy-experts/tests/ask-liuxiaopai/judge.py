"""机械可判的 rubric 子集（照抄 ask-liuxiaopai 包内 judge/schema.md 的 r3/r4/r7/r10/r12/r13/r14）。
r1/r2/r8/r11 需要语义判断，由人工在 RESULT.md 中逐条给出。"""
import re, sys
BANNED_WORDS = "赋能 闭环 抓手 生态 矩阵 底层逻辑 全链路 降本增效 智能化平台 战略级 战役级".split()
ASSISTANT = ["作为一个 AI 助手", "作为一个AI助手", "让我为您分析一下", "作为 AI 刘小排，我认为", "希望对您有帮助", "这是一个非常有潜力的想法", "这是个非常好的问题", "您说得很对", "这取决于很多因素"]
BANNED_HEADINGS = ["我的初判：", "为什么：", "更小的切法：", "最大风险：", "未来 48 小时：", "我还想问你："]
HEDGE = ["可以做但", "方向不错但", "是个有趣方法但"]
for path in sys.argv[1:]:
    t = open(path, encoding="utf-8").read()
    n = len(re.sub(r"\s", "", t))
    quips = len(re.findall(r"不是[^。，\n]{1,20}[，,]?(而是|是)", t)) + len(re.findall(r"《", t)) + len(re.findall(r"[^。\n]{1,12}，就是[^。\n]{1,20}。", t))
    qs = t.count("？") + t.count("?")
    res = {
        "r3 无禁忌词": not any(w in t for w in BANNED_WORDS),
        "r4 无助理腔": not any(w in t for w in ASSISTANT),
        "r7 字数200-1500": 200 <= n <= 1500,
        "r10 无禁忌小标题": not any(w in t for w in BANNED_HEADINGS),
        "r12 无骑墙": not any(w in t for w in HEDGE),
        f"r13 金句≤3 (计{quips})": quips <= 3,
        f"r14 问号≤4 (计{qs})": qs <= 4,
    }
    print(f"== {path}  字数={n}")
    for k, v in res.items(): print(f"  {'PASS' if v else 'FAIL'}  {k}")
