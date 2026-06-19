# Borneo Hardware Trading — EastStar demo kit

A fictional Kuching building-materials distributor used as a **before → after** sales
demo for EastStar Analytics prospects. One seeded dataset (FY2025, 715 orders, RM1.34M)
told three ways.

## What to show a client

| # | File | What it proves | Tier |
|---|------|----------------|------|
| 1 | `1_messy_sales_2025_BEFORE.xlsx` | "This is what you have today" — 12 inconsistent monthly tabs, mixed date formats, salesperson names spelled 5 ways, hand-typed (sometimes wrong) totals | the pain |
| 2 | `2_clean_dashboard_2025_AFTER.xlsx` | One clean Data table → a live, formula-driven Dashboard with charts. Paste a new row, every KPI moves. | Excel Automation + Power BI |
| 3 | `3_web_dashboard.html` | Same numbers as a branded, interactive web dashboard with a live branch filter — opens on any phone, shareable over WhatsApp | Dashboards / data platform |

**Suggested pitch flow:** open file 1 ("recognise this?"), then file 2 (same data, one click to any answer), then send file 3's link over WhatsApp so it lives on their phone.

## Rebuilding / changing the data

```bash
python3 build_data.py     # regenerate canonical data.json (edit seed/products here)
python3 build_messy.py    # -> 1_messy_sales_2025_BEFORE.xlsx
python3 build_clean.py    # -> 2_clean_dashboard_2025_AFTER.xlsx
python3 build_web.py      # -> 3_web_dashboard.html
```

To make this a **per-industry** kit (logistics, manufacturing, construction…), edit the
`PRODUCTS` / `CUSTOMERS` / `BRANCHES` lists in `build_data.py` and re-run all four scripts —
the Excel and web layouts adapt automatically.

> All data is randomly generated for demonstration. Borneo Hardware Trading is not a real company.
