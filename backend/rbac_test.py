#!/usr/bin/env python3
"""End-to-end RBAC smoke test for the Hostel Management System backend.

Run against a fresh backend listening on http://127.0.0.1:8090
(see backend/RBAC_TEST.md for instructions).
"""
import json, sys, urllib.request, urllib.error

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
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read().decode() or "{}"
            return r.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        raw = e.read().decode() if e.fp else "{}"
        try: return e.code, json.loads(raw)
        except json.JSONDecodeError: return e.code, {"raw": raw}

def check(label, cond, detail=""):
    mark = "✅" if cond else "❌"
    extra = "" if cond else f"  ← {detail}"
    print(f"  {mark} {label}{extra}")
    results.append(cond)

# 1. admin login
code, body = call("POST", "/api/auth/login", body={"email": "admin@hostel.com", "password": "admin123"})
admin = body.get("data", {}).get("accessToken", "")
check("1.  admin login", code == 200 and len(admin) > 50, f"code={code}")

# 2. demo student gone
code, body = call("POST", "/api/auth/login", body={"email": "student@hostel.com", "password": "student123"})
check("2.  demo student auto-seed disabled", body.get("success") is False, str(body)[:80])

# 3. admin creates student
code, body = call("POST", "/api/students", token=admin,
                  body={"name": "Bob", "email": "bob@hms.com", "phone": "9000000002",
                        "rollNumber": "R042", "year": 3})
sid = body.get("data", {}).get("id")
pw  = body.get("data", {}).get("tempPassword")
check("3.  admin POST /api/students", code == 200 and pw == "r042", f"id={sid} pw={pw}")

# 4. bob login
code, body = call("POST", "/api/auth/login", body={"email": "bob@hms.com", "password": pw or ""})
bob = body.get("data", {}).get("accessToken", "")
check("4.  newly registered student logs in", code == 200 and len(bob) > 50, str(body)[:80])

# 5. admin endpoints rejected for student
fails_5 = []
for p in ["/api/students", "/api/rooms", "/api/fees", "/api/attendance", "/api/visitors",
          "/api/dashboard/stats", "/api/analytics", "/api/complaints", "/api/maintenance"]:
    c, _ = call("GET", p, token=bob)
    if c != 403: fails_5.append(f"{p}={c}")
check("5.  9 admin endpoints all return 403 to student", not fails_5, ", ".join(fails_5))

# 6. /me/* and /api/notices return 200
fails_6 = []
for p in ["/api/me/user", "/api/me/student", "/api/me/room", "/api/me/fees",
          "/api/me/attendance", "/api/me/complaints", "/api/me/maintenance",
          "/api/me/notices", "/api/me/dashboard", "/api/notices"]:
    c, _ = call("GET", p, token=bob)
    if c != 200: fails_6.append(f"{p}={c}")
check("6.  10 self-scoped endpoints return 200", not fails_6, ", ".join(fails_6))

# 7. /me/student is bob's own
code, body = call("GET", "/api/me/student", token=bob)
roll = body.get("data", {}).get("rollNumber")
check("7.  /api/me/student returns own profile", roll == "R042", f"got {roll!r}")

# 8. complaint POST
code, body = call("POST", "/api/me/complaints", token=bob,
                  body={"title": "AC", "category": "ELECTRICAL", "priority": "HIGH"})
check("8.  POST /api/me/complaints", body.get("success") is True, str(body)[:80])

# 9. maintenance POST
code, body = call("POST", "/api/me/maintenance", token=bob,
                  body={"title": "Door", "category": "FURNITURE", "priority": "MEDIUM"})
check("9.  POST /api/me/maintenance", body.get("success") is True, str(body)[:80])

# 10. own complaints list
code, body = call("GET", "/api/me/complaints", token=bob)
n = len(body.get("data", []))
check("10. /api/me/complaints scoped to own user", n == 1, f"count={n}")

# 11. admin delete
code, body = call("DELETE", f"/api/students/{sid}", token=admin)
check("11. admin DELETE returns 200", code == 200, f"code={code}")

# 12. login revoked
code, body = call("POST", "/api/auth/login", body={"email": "bob@hms.com", "password": pw})
check("12. login refused after delete", body.get("success") is False, str(body)[:120])

# 13. existing JWT rejected
code, _ = call("GET", "/api/me/student", token=bob)
check("13. existing JWT rejected after deactivation", code in (401, 403), f"code={code}")

# 14. duplicate email rejected
code, body = call("POST", "/api/students", token=admin,
                  body={"name": "X", "email": "bob@hms.com", "rollNumber": "R999"})
check("14. duplicate email rejected", body.get("success") is False, str(body)[:120])

print()
passed = sum(results); total = len(results)
print(f"  Passed: {passed} / {total}    Failed: {total - passed}")
sys.exit(0 if passed == total else 1)
