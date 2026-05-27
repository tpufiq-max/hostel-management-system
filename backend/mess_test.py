#!/usr/bin/env python3
"""End-to-end verification of the Smart Mess Management module.

Run against a fresh backend listening on http://127.0.0.1:8090
(see backend/MESS_TEST.md or run with the helper instructions in the PR).

Checks:
 1. Admin login works.
 2. Admin creates a student with rollNumber R555 and the student logs in.
 3. Admin marks for date d1: B=PRESENT, L=PRESENT, D=ABSENT, SPECIAL=PRESENT.
 4. Admin GET /api/mess/bills/{id} returns daily total = ₹100 + ₹50 = ₹150.
 5. Day d2: B=PRESENT, L=PRESENT, D=PRESENT, SPECIAL=ABSENT → daily ₹115.
 6. Day d3: B=PRESENT only → daily ₹50.
 7. Monthly grand total = ₹315.
 8. Student GET /api/me/mess/bill returns the same numbers.
 9. Student GET /api/mess/bills/{otherStudentId} returns 403.
10. Idempotency: marking the same (date, mealType) twice doesn't create
    a duplicate row.
"""
import json
import sys
import urllib.request
import urllib.error
from datetime import date

BASE = "http://127.0.0.1:8090"
results = []


def call(method, path, token=None, body=None):
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read().decode() or "{}"
            return r.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode() if e.fp else "{}"
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, {"raw": raw}


def check(label, cond, detail=""):
    mark = "✅" if cond else "❌"
    extra = "" if cond else f"   ← {detail}"
    print(f"  {mark} {label}{extra}")
    results.append(cond)


def post_attendance(token, when, entries):
    return call(
        "POST",
        "/api/mess/attendance",
        token=token,
        body={"date": when.isoformat(), "entries": entries},
    )


# ── pick a year/month that won't collide with current-month rows ──
# Use a fixed historical month so re-runs against a non-clean DB still pass.
YEAR = 2031
MONTH = 6
D1 = date(YEAR, MONTH, 5)
D2 = date(YEAR, MONTH, 6)
D3 = date(YEAR, MONTH, 7)


# ── 1. admin login ────────────────────────────────────────────────────
code, body = call("POST", "/api/auth/login",
                  body={"email": "admin@hostel.com", "password": "admin123"})
admin = body.get("data", {}).get("accessToken", "")
check("1. admin login", code == 200 and len(admin) > 50, f"code={code}")

# ── 2. admin creates student R555, student logs in ────────────────────
code, body = call("POST", "/api/students", token=admin,
                  body={"name": "Mess Tester", "email": "mess555@hms.com",
                        "phone": "9000005550", "rollNumber": "R555", "year": 2})
sid = body.get("data", {}).get("id")
pw = body.get("data", {}).get("tempPassword")
created_ok = code == 200 and pw == "r555" and sid is not None

# Also create a SECOND student for the "another student's bill is 403" check.
code2, body2 = call("POST", "/api/students", token=admin,
                    body={"name": "Other", "email": "other555@hms.com",
                          "phone": "9000005551", "rollNumber": "R556", "year": 2})
other_id = body2.get("data", {}).get("id")

code, body = call("POST", "/api/auth/login",
                  body={"email": "mess555@hms.com", "password": pw or ""})
student = body.get("data", {}).get("accessToken", "")
check("2. admin creates R555 + student logs in",
      created_ok and len(student) > 50 and other_id is not None,
      f"sid={sid} pw={pw} other={other_id}")

# ── 3. mark D1: B=P, L=P, D=A, SPECIAL=P ──────────────────────────────
code, body = post_attendance(admin, D1, [
    {"studentId": sid, "mealType": "BREAKFAST",      "status": "PRESENT"},
    {"studentId": sid, "mealType": "LUNCH",          "status": "PRESENT"},
    {"studentId": sid, "mealType": "DINNER",         "status": "ABSENT"},
    {"studentId": sid, "mealType": "SPECIAL_DINNER", "status": "PRESENT"},
])
check("3. admin marks day-1 (B=P,L=P,D=A,SPECIAL=P)",
      code == 200 and body.get("success") is True
      and body.get("data", {}).get("marked") == 4,
      str(body)[:160])

# ── 4. day-1 charge = 100 + 50 = 150 ──────────────────────────────────
code, body = call("GET", f"/api/mess/bills/{sid}?year={YEAR}&month={MONTH}", token=admin)
days = body.get("data", {}).get("days", []) if isinstance(body.get("data"), dict) else []
d1_row = next((d for d in days if d.get("date") == D1.isoformat()), None)
check("4. day-1 total = ₹150 (₹100 base + ₹50 special)",
      d1_row is not None and d1_row.get("total") == 150 and d1_row.get("baseCharge") == 100
      and d1_row.get("specialDinnerCharge") == 50 and d1_row.get("mealsCount") == 2,
      str(d1_row)[:200])

# ── 5. mark D2: B=P, L=P, D=P, SPECIAL=A → 115 ────────────────────────
code, body = post_attendance(admin, D2, [
    {"studentId": sid, "mealType": "BREAKFAST",      "status": "PRESENT"},
    {"studentId": sid, "mealType": "LUNCH",          "status": "PRESENT"},
    {"studentId": sid, "mealType": "DINNER",         "status": "PRESENT"},
    {"studentId": sid, "mealType": "SPECIAL_DINNER", "status": "ABSENT"},
])
code, body = call("GET", f"/api/mess/bills/{sid}?year={YEAR}&month={MONTH}", token=admin)
days = body.get("data", {}).get("days", []) if isinstance(body.get("data"), dict) else []
d2_row = next((d for d in days if d.get("date") == D2.isoformat()), None)
check("5. day-2 total = ₹115 (3 meals, no special)",
      d2_row is not None and d2_row.get("total") == 115
      and d2_row.get("baseCharge") == 115 and d2_row.get("mealsCount") == 3
      and d2_row.get("specialDinnerCharge") == 0,
      str(d2_row)[:200])

# ── 6. mark D3: B=P only → 50 ─────────────────────────────────────────
code, body = post_attendance(admin, D3, [
    {"studentId": sid, "mealType": "BREAKFAST",      "status": "PRESENT"},
    {"studentId": sid, "mealType": "LUNCH",          "status": "ABSENT"},
    {"studentId": sid, "mealType": "DINNER",         "status": "ABSENT"},
    {"studentId": sid, "mealType": "SPECIAL_DINNER", "status": "ABSENT"},
])
code, body = call("GET", f"/api/mess/bills/{sid}?year={YEAR}&month={MONTH}", token=admin)
days = body.get("data", {}).get("days", []) if isinstance(body.get("data"), dict) else []
d3_row = next((d for d in days if d.get("date") == D3.isoformat()), None)
check("6. day-3 total = ₹50 (1 meal, no special)",
      d3_row is not None and d3_row.get("total") == 50
      and d3_row.get("mealsCount") == 1,
      str(d3_row)[:200])

# ── 7. monthly grand total = 315 ──────────────────────────────────────
grand = body.get("data", {}).get("grandTotal") if isinstance(body.get("data"), dict) else None
check("7. monthly grandTotal = ₹315 (150 + 115 + 50)",
      grand == 315, f"grandTotal={grand!r} days={[d.get('total') for d in days]}")

# ── 8. /api/me/mess/bill returns identical numbers for the student ────
code, body = call("GET", f"/api/me/mess/bill?year={YEAR}&month={MONTH}", token=student)
my = body.get("data", {}) if isinstance(body.get("data"), dict) else {}
my_grand = my.get("grandTotal")
my_days = my.get("days", [])
my_d1 = next((d for d in my_days if d.get("date") == D1.isoformat()), {})
my_d2 = next((d for d in my_days if d.get("date") == D2.isoformat()), {})
my_d3 = next((d for d in my_days if d.get("date") == D3.isoformat()), {})
check("8. student /api/me/mess/bill mirrors admin totals",
      code == 200 and my_grand == 315
      and my_d1.get("total") == 150 and my_d2.get("total") == 115 and my_d3.get("total") == 50,
      f"grand={my_grand} d1={my_d1.get('total')} d2={my_d2.get('total')} d3={my_d3.get('total')}")

# ── 9. student hitting admin /api/mess/bills/{otherId} → 403 ──────────
code, body = call("GET", f"/api/mess/bills/{other_id}?year={YEAR}&month={MONTH}", token=student)
check("9. student GET /api/mess/bills/{otherStudentId} → 403",
      code == 403, f"code={code} body={str(body)[:120]}")

# ── 10. idempotency — repeat (D1, BREAKFAST) marks ────────────────────
# Mark the same (D1, BREAKFAST) twice more, then verify the bill totals
# haven't changed (no duplicate rows = no double-counting).
post_attendance(admin, D1, [{"studentId": sid, "mealType": "BREAKFAST", "status": "PRESENT"}])
post_attendance(admin, D1, [{"studentId": sid, "mealType": "BREAKFAST", "status": "PRESENT"}])
code, body = call("GET", f"/api/mess/bills/{sid}?year={YEAR}&month={MONTH}", token=admin)
final_grand = body.get("data", {}).get("grandTotal") if isinstance(body.get("data"), dict) else None
final_days = body.get("data", {}).get("days", []) if isinstance(body.get("data"), dict) else []
final_d1 = next((d for d in final_days if d.get("date") == D1.isoformat()), {})
check("10. idempotency: re-marking (date, mealType) doesn't duplicate",
      final_grand == 315 and final_d1.get("total") == 150
      and final_d1.get("mealsCount") == 2,
      f"grand={final_grand} d1={final_d1}")

print()
passed = sum(results)
total = len(results)
print(f"  Passed: {passed} / {total}    Failed: {total - passed}")
sys.exit(0 if passed == total else 1)
