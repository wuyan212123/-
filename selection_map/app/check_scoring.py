"""对比 scoring.py 与 app/scoring.js 的结果，必须逐条一致。
用法：python3 selection_map/app/check_scoring.py
会用到 node；测试样例的导入结果也一并对比。"""
import copy, json, os, subprocess, sys, tempfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); SM = os.path.dirname(HERE)
sys.path.insert(0, SM)
import scoring, ingest

def cases():
    db = json.load(open(os.path.join(SM, "data", "product_map.json"), encoding="utf-8"))
    yield "product_map", db
    tmp = tempfile.mkdtemp(); p = os.path.join(tmp, "pm.json")
    shutil.copy(os.path.join(SM, "data", "product_map.json"), p)
    ingest.run(p, os.path.join(SM, "tests", "fixtures"))
    yield "fixtures", json.load(open(p, encoding="utf-8"))
    shutil.rmtree(tmp)
    # 边界：逐个改动关键字段
    db2 = copy.deepcopy(db); m = db2["meta"]; vary = []
    base = next(r for r in db2["records"] if r["id"] == "C071")
    for n_pass in (None, 1, 2, 3):
        for cr1 in (None, 0.4, 0.55, 0.7):
            for yoy in (None, -0.3, 0.1, 0.25):
                for st in ("空白", "规划中", "已有", "部分覆盖"):
                    r = copy.deepcopy(base); r.update(n_pass=n_pass, cr1=cr1, cr3=None if cr1 is None else cr1 + 0.2, yoy_growth=yoy, meeden_status=st,
                                                     seg_revenue_top10=None if n_pass is None else 150000 * n_pass, n_new_top50=n_pass, price_p50=12.5,
                                                     risk_flags=["child"] if yoy == 0.1 else (["hazmat"] if yoy == -0.3 and st == "空白" else []))
                    r["id"] = f"X{len(vary):04d}"; vary.append(r)
    db2["records"] = vary
    yield "boundary", db2

bad = 0
for name, db in cases():
    meta = db["meta"]
    js = subprocess.run(["node", "-e", """
const S=require(process.argv[1]); const db=JSON.parse(require('fs').readFileSync(0,'utf8'));
const out={}; for(const r of db.records) out[r.id]=S.score(r, db.meta); process.stdout.write(JSON.stringify(out));
""", os.path.join(HERE, "scoring.js")], input=json.dumps(db, ensure_ascii=False), capture_output=True, text=True, check=True)
    jres = json.loads(js.stdout)
    for r in db["records"]:
        r = copy.deepcopy(r)
        r["gate_g1"], r["gate_g2"], r["gate_g3"] = scoring.gates(r, meta["thresholds"])
        s, b, c, g = scoring.mos(r, meta); r.update(mos_score=s, mos_breakdown=b, mos_complete=c, data_gaps=g)
        sug = scoring.suggest(r, meta)
        py = {"gate_g1": r["gate_g1"], "gate_g2": r["gate_g2"], "gate_g3": r["gate_g3"], "mos_score": s, "mos_breakdown": b, "mos_complete": c, "data_gaps": g, "conclusion_suggested": sug}
        if py != jres[r["id"]]:
            bad += 1
            if bad <= 5: print("MISMATCH", name, r["id"], py, jres[r["id"]])
    print(name, len(db["records"]), "records checked")
print("ALL MATCH" if not bad else f"{bad} MISMATCHES"); sys.exit(1 if bad else 0)
