"""把 scoring.js 内联进 app_template.html，生成可发布的单文件网页 meeden-product-map.html。
用法：python3 selection_map/app/build_app.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main():
    tpl = (HERE / "app_template.html").read_text(encoding="utf-8")
    js = (HERE / "scoring.js").read_text(encoding="utf-8")
    assert "/*__SCORING__*/" in tpl
    out = HERE / "meeden-product-map.html"
    out.write_text(tpl.replace("/*__SCORING__*/", js), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
