#!/usr/bin/env python3
"""把通用引擎和各品类数据拼成一个单文件页面：品类细分/开品维度图谱.html

用法：python3 品类细分/src/build.py
新增品类：在 categories/ 下按 _template.js 新建一个 .js 文件，然后把文件名加进 ORDER（不加则排在最后）。
以下划线开头的文件（如 _template.js）不会被打包。
"""
import pathlib

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / "开品维度图谱.html"
ORDER = ["pen", "book"]  # 品类标签的显示顺序


def main() -> None:
    cats = [p for p in (SRC / "categories").glob("*.js") if not p.name.startswith("_")]
    cats.sort(key=lambda p: (ORDER.index(p.stem) if p.stem in ORDER else len(ORDER), p.stem))
    parts = [(SRC / "engine" / "page.html").read_text(encoding="utf-8")]
    parts += [p.read_text(encoding="utf-8") for p in cats]
    parts += [(SRC / "engine" / "figs.js").read_text(encoding="utf-8"),
              (SRC / "engine" / "app.js").read_text(encoding="utf-8")]
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"已生成 {OUT.name}：{len(cats)} 个品类（{', '.join(p.stem for p in cats)}），{OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
