"""Generate the canonical sales dataset for Borneo Hardware Trading Sdn Bhd.
One seeded source of truth -> exported to data.json, consumed by the Excel + web builds."""
import json, random, datetime as dt
from pathlib import Path

random.seed(42)
HERE = Path(__file__).parent

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

PRODUCTS = [
    ("OPC Cement 50kg",      "Cement & Aggregates", 19),
    ("Sand (per ton)",       "Cement & Aggregates", 55),
    ("Red Brick (per 1000)", "Cement & Aggregates", 480),
    ("Steel Bar Y12",        "Steel & Metal",       32),
    ("Steel Bar Y16",        "Steel & Metal",       56),
    ("Wire Nails 50kg",      "Steel & Metal",       145),
    ("Plywood 18mm",         "Timber & Boards",     78),
    ("Marine Plywood 12mm",  "Timber & Boards",     65),
    ("Roofing Sheet 0.4mm",  "Roofing & Cladding",  28),
    ("PVC Pipe 4in",         "Plumbing",            22),
    ("Emulsion Paint 18L",   "Paint & Finishes",   165),
    ("Cordless Drill",       "Tools & Hardware",   280),
]

REPS = ["Ahmad Faizal", "Lim Ah Hock", "Rosli bin Osman", "Catherine Wong", "Mohd Idris"]
BRANCHES = ["Kuching", "Sibu", "Miri", "Bintulu"]
CUSTOMERS = [
    "Hock Seng Construction", "Borneo Builders Sdn Bhd", "Sarawak Renovation Works",
    "Kuching DIY Mart", "Rajang Hardware Supply", "Miri Coastal Developments",
    "Bintulu Industrial Trading", "Sibu Home Improvement", "Eastwood Contractors",
    "Greenfield Property", "Permata Construction", "Unggul Builders",
    "Samarahan Renovators", "Bayu Hardware Retail", "Delta Engineering",
]

# Seasonal multipliers: construction dips in monsoon (Nov-Jan), peaks mid-year.
SEASON = [0.82,0.88,1.0,1.05,1.12,1.18,1.15,1.1,1.08,1.0,0.85,0.95]
# Branch demand share
BRANCH_W = {"Kuching":0.40,"Sibu":0.22,"Miri":0.24,"Bintulu":0.14}

def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]

# Product popularity weights (cement/steel move the most)
PROD_W = [1.0,0.5,0.35,0.9,0.7,0.4,0.55,0.45,0.6,0.5,0.3,0.25]

records = []
oid = 1000
for mi, mon in enumerate(MONTHS):
    n_orders = int(random.uniform(48, 72) * SEASON[mi])
    days_in_month = [31,28,31,30,31,30,31,31,30,31,30,31][mi]
    for _ in range(n_orders):
        oid += 1
        day = random.randint(1, days_in_month)
        date = dt.date(2025, mi+1, day)
        pname, pcat, unit = weighted_choice(PRODUCTS, PROD_W)
        branch = weighted_choice(BRANCHES, [BRANCH_W[b] for b in BRANCHES])
        rep = random.choice(REPS)
        cust = random.choice(CUSTOMERS)
        qty = max(1, int(random.expovariate(1/14)) + 1)
        # occasional bulk order
        if random.random() < 0.08:
            qty *= random.randint(3, 8)
        line_unit = round(unit * random.uniform(0.97, 1.06), 2)  # small price variance
        amount = round(qty * line_unit, 2)
        paid = random.random() > 0.18  # ~18% outstanding receivables
        records.append({
            "order_id": f"INV-{date.year}{mi+1:02d}-{oid}",
            "date": date.isoformat(),
            "month": mon,
            "month_index": mi+1,
            "branch": branch,
            "rep": rep,
            "customer": cust,
            "product": pname,
            "category": pcat,
            "qty": qty,
            "unit_price": line_unit,
            "amount": amount,
            "paid": paid,
        })

records.sort(key=lambda r: r["date"])

# ---- Pre-computed rollups for the web dashboard (Excel computes its own via formulas) ----
def rollup(key):
    out = {}
    for r in records:
        out[r[key]] = out.get(r[key], 0) + r["amount"]
    return {k: round(v, 2) for k, v in out.items()}

by_month = {m: 0.0 for m in MONTHS}
for r in records:
    by_month[r["month"]] += r["amount"]
by_month = {m: round(v, 2) for m, v in by_month.items()}

outstanding = round(sum(r["amount"] for r in records if not r["paid"]), 2)
total_rev = round(sum(r["amount"] for r in records), 2)

summary = {
    "company": "Borneo Hardware Trading Sdn Bhd",
    "period": "FY2025",
    "currency": "RM",
    "total_revenue": total_rev,
    "total_orders": len(records),
    "avg_order": round(total_rev/len(records), 2),
    "outstanding_receivables": outstanding,
    "months": MONTHS,
    "by_month": by_month,
    "by_branch": rollup("branch"),
    "by_rep": rollup("rep"),
    "by_category": rollup("category"),
    "by_product": rollup("product"),
}

data = {"summary": summary, "records": records,
        "meta": {"reps": REPS, "branches": BRANCHES, "products": PRODUCTS,
                 "customers": CUSTOMERS, "months": MONTHS}}

(HERE/"data.json").write_text(json.dumps(data, indent=2))
print(f"records={len(records)} total_rev=RM{total_rev:,.0f} outstanding=RM{outstanding:,.0f}")
print("by_month:", {m: f'{v:,.0f}' for m,v in by_month.items()})
