"""Compute grounded metrics for the AI Monthly Brief demo -> ai_brief.json.
The web widget turns these numbers into natural-language briefs (EN/BM) client-side,
mirroring what an LLM automation would produce from the same data each month."""
import json
from pathlib import Path

HERE = Path(__file__).parent
data = json.loads((HERE/"data.json").read_text())
recs = data["records"]
MONTHS = data["meta"]["months"]
FULL = {"Jan":"January","Feb":"February","Mar":"March","Apr":"April","May":"May","Jun":"June",
        "Jul":"July","Aug":"August","Sep":"September","Oct":"October","Nov":"November","Dec":"December"}
FULL_BM = {"Jan":"Januari","Feb":"Februari","Mar":"Mac","Apr":"April","May":"Mei","Jun":"Jun",
           "Jul":"Julai","Aug":"Ogos","Sep":"September","Oct":"Oktober","Nov":"November","Dec":"Disember"}

def metrics(rows):
    rev = sum(r["amount"] for r in rows)
    n = len(rows)
    out = sum(r["amount"] for r in rows if not r["paid"])
    def top(key):
        agg = {}
        for r in rows: agg[r[key]] = agg.get(r[key],0)+r["amount"]
        items = sorted(agg.items(), key=lambda x:-x[1])
        return agg, items
    cat_a, cat = top("category")
    rep_a, rep = top("rep")
    br_a, br = top("branch")
    prod_a, prod = top("product")
    cust_a, cust = top("customer")
    return {
        "revenue": round(rev), "orders": n, "avg": round(rev/n) if n else 0,
        "outstanding": round(out), "outstanding_pct": round(out/rev*100) if rev else 0,
        "top_cat": [cat[0][0], round(cat[0][1]/rev*100)] if cat else None,
        "top_rep": [rep[0][0], round(rep[0][1])] if rep else None,
        "top_branch": [br[0][0], round(br[0][1])] if br else None,
        "weak_branch": [br[-1][0], round(br[-1][1])] if br else None,
        "top_product": [prod[0][0], round(prod[0][1])] if prod else None,
        "top_customer": [cust[0][0], round(cust[0][1])] if cust else None,
    }

out = {"currency": "RM", "company": data["summary"]["company"],
       "fullnames": FULL, "fullnames_bm": FULL_BM, "order": MONTHS, "months": {}}

prev_rev = None
for m in MONTHS:
    rows = [r for r in recs if r["month"] == m]
    mm = metrics(rows)
    mm["mom"] = round((mm["revenue"]-prev_rev)/prev_rev*100) if prev_rev else None
    mm["prev"] = MONTHS[MONTHS.index(m)-1] if MONTHS.index(m) > 0 else None
    out["months"][m] = mm
    prev_rev = mm["revenue"]

fy = metrics(recs)
month_rev = {m: out["months"][m]["revenue"] for m in MONTHS}
best = max(month_rev, key=month_rev.get); worst = min(month_rev, key=month_rev.get)
fy["best_month"] = [best, month_rev[best]]
fy["worst_month"] = [worst, month_rev[worst]]
fy["avg_month"] = round(fy["revenue"]/12)
out["fy"] = fy

(HERE/"ai_brief.json").write_text(json.dumps(out, indent=1))
print("FY rev RM%d | best %s (RM%d) | worst %s (RM%d) | outstanding %d%%"
      % (fy["revenue"], best, month_rev[best], worst, month_rev[worst], fy["outstanding_pct"]))
print("top rep:", fy["top_rep"], "| top product:", fy["top_product"], "| top branch:", fy["top_branch"])
