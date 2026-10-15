"""把 src/ 下的样式、外壳与脚本内联为单文件页面。
输出：
  dist/workbench.html  —— Artifact 发布用片段（无 doctype/html/head/body，由发布方包裹）
  index.html           —— 本地直接用浏览器打开的完整页面
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
css = (src / 'styles.css').read_text(encoding='utf-8')
shell = (src / 'shell.html').read_text(encoding='utf-8')
js = '\n'.join((src / f).read_text(encoding='utf-8') for f in ['data.js', 'app-core.js', 'app-country.js', 'app-viz.js', 'app-cols.js', 'app-cover.js', 'app-detail.js', 'app-pages.js', 'app-main.js', 'app-test.js'])
head = '<title>进销存协作工作台</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
frag = f'{head}<style>\n{css}\n</style>\n{shell}\n<script>\n{js}\n</script>\n'
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'workbench.html').write_text(frag, encoding='utf-8')
full = ('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        f'{head}<style>\n:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}[hidden]{{display:none!important}}\n{css}\n</style>\n</head>\n<body>\n{shell}\n<script>\n{js}\n</script>\n</body>\n</html>\n')
(root / 'index.html').write_text(full, encoding='utf-8')
print('built', len(frag), 'bytes')
