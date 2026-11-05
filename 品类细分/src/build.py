#!/usr/bin/env python3
"""把通用引擎和各品类数据拼成一个单文件页面：品类细分/开品维度图谱.html

用法：python3 品类细分/src/build.py              打包全部品类 → 开品维度图谱.html
      python3 品类细分/src/build.py book         只打包指定品类 → 水彩本_开品维度图谱.html
新增品类：在 categories/ 下按 _template.js 新建一个 .js 文件，然后把文件名加进 ORDER（不加则排在最后）。
以下划线开头的文件（如 _template.js）不会被打包。
"""
import pathlib
import re
import sys

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / "开品维度图谱.html"
ORDER = ["pen", "book"]  # 品类标签的显示顺序


def main() -> None:
    only = sys.argv[1:]
    cats = [p for p in (SRC / "categories").glob("*.js") if not p.name.startswith("_") and (not only or p.stem in only)]
    if not cats:
        sys.exit(f"没有找到品类：{only}")
    cats.sort(key=lambda p: (ORDER.index(p.stem) if p.stem in ORDER else len(ORDER), p.stem))
    page = (SRC / "engine" / "page.html").read_text(encoding="utf-8")
    out = OUT
    if only:
        names = [re.search(r'name:"([^"]+)"', p.read_text(encoding="utf-8")).group(1) for p in cats]
        out = SRC.parent / f"{'_'.join(names)}_开品维度图谱.html"
        page = page.replace("<title>开品维度图谱</title>", f"<title>{'、'.join(names)}开品维度图谱</title>", 1)
    parts = [page]
    parts += [p.read_text(encoding="utf-8") for p in cats]
    parts += [(SRC / "engine" / "figs.js").read_text(encoding="utf-8"),
              (SRC / "engine" / "app.js").read_text(encoding="utf-8")]
    out.write_text("\n".join(parts), encoding="utf-8")
    print(f"已生成 {out.name}：{len(cats)} 个品类（{', '.join(p.stem for p in cats)}），{out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
