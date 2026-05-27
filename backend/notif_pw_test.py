#!/usr/bin/env python3
"""Verifies /api/notifications + /api/auth/change-password end-to-end."""
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
    extra = "" if cond else f"   ← {detail}"
    print(f"  {mark} {label}{extra}")
    results.append(cond)

# Bootstrap
admin_login = call("POST", "/api/auth/login", body={"email": "admin@hostel.com", "password": "admin123"})
admin = admin_login[1].get("data", {}).get("accessToken", "")
check("admin login", admin_login[0] == 200 and len(admin) > 50, str(admin_login)[:120])

# Create some real signals so the feed isn't empty
created_student = call("POST", "/api/students", token=admin,
                       body={"name": "Carol", "email": "carol@hms.com", "phone": "9000000003",
                             "rollNumber": "R100", "year": 2})
sid = created_student[1].get("data", {}).get("id")
pw  = created_student[1].get("data", {}).get("tempPassword")
check("admin creates student", created_student[0] == 200 and pw == "r100", str(created_student)[:160])

# Carol logs in and submits a complaint + maintenance ticket
carol_login = call("POST", "/api/auth/login", body={"email": "carol@hms.com", "password": pw})
carol = carol_login[1].get("data", {}).get("accessToken", "")
check("student login", len(carol) > 50, str(carol_login)[:120])

call("POST", "/api/me/complaints", token=carol,
     body={"title": "Tap leaking", "description": "Bathroom tap drips overnight",
           "category": "PLUMBING", "priority": "HIGH"})
call("POST", "/api/me/maintenance", token=carol,
     body={"title": "Light flickering", "category": "ELECTRICAL", "priority": "MEDIUM"})

# 1. Admin notifications feed includes the complaint and the maintenance request
code, body = call("GET", "/api/notifications", token=admin)
items = body.get("data", []) if isinstance(body.get("data"), list) else []
types = {i["type"] for i in items}
ids   = {i["id"]   for i in items}
check("admin /api/notifications returns items",  code == 200 and len(items) > 0, f"code={code} count={len(items)}")
check("admin feed includes 'complaint' type",    "complaint" in types,           f"types={types}")
check("admin feed includes 'maintenance' type",  "maintenance" in types,         f"types={types}")
check("each item has stable id, severity, link", all(
    {"id", "type", "severity", "title", "link", "createdAt"}.issubset(set(i.keys())) for i in items
), str(items[0]) if items else "")

# 2. Student feed is scoped to Carol — fees/complaints/maintenance only her own
code, body = call("GET", "/api/notifications", token=carol)
ms = body.get("data", []) if isinstance(body.get("data"), list) else []
check("student /api/notifications returns items", code == 200 and len(ms) > 0, f"code={code} count={len(ms)}")
own_complaint = next((i for i in ms if i["type"] == "complaint"), None)
own_maint     = next((i for i in ms if i["type"] == "maintenance"), None)
check("student sees own complaint",   own_complaint and "Tap leaking" in (own_complaint.get("message") or ""),
      str(own_complaint)[:160])
check("student sees own maintenance", own_maint and "Light" in (own_maint.get("message") or ""),
      str(own_maint)[:160])
check("student complaint links to /me/complaints",   own_complaint and own_complaint.get("link") == "/me/complaints",
      str(own_complaint)[:160] if own_complaint else "")

# 3. Visitor-list-side check — no admin scope leaks: student should NOT see admin-only types
admin_only_types_seen = {i["type"] for i in ms if i["type"] in ("visitor",)}
check("student feed has no 'visitor' (admin-only)", admin_only_types_seen == set(),
      f"leaked={admin_only_types_seen}")

# 4. Change password — happy path
code, body = call("POST", "/api/auth/change-password", token=carol,
                  body={"currentPassword": pw, "newPassword": "NewPass2025!"})
check("change-password 200 on happy path", code == 200 and body.get("success") is True,
      str(body)[:160])

# 5. Old password can no longer log in; new one can
old = call("POST", "/api/auth/login", body={"email": "carol@hms.com", "password": pw})
check("old password rejected after change",
      old[1].get("success") is False, str(old)[:160])

new = call("POST", "/api/auth/login", body={"email": "carol@hms.com", "password": "NewPass2025!"})
check("new password works", new[0] == 200 and len(new[1].get("data", {}).get("accessToken", "")) > 50,
      str(new)[:160])

# 6. Wrong current password rejected
new_token = new[1].get("data", {}).get("accessToken", "")
wrong = call("POST", "/api/auth/change-password", token=new_token,
             body={"currentPassword": "obviously-wrong", "newPassword": "Yet@Another1"})
check("wrong current password rejected with helpful message",
      wrong[0] == 400 and "incorrect" in (wrong[1].get("message") or "").lower(),
      str(wrong)[:160])

# 7. Same password rejected
same = call("POST", "/api/auth/change-password", token=new_token,
            body={"currentPassword": "NewPass2025!", "newPassword": "NewPass2025!"})
check("identical new password rejected",
      same[0] == 400 and "different" in (same[1].get("message") or "").lower(),
      str(same)[:160])

# 8. Short password rejected by validation
short = call("POST", "/api/auth/change-password", token=new_token,
             body={"currentPassword": "NewPass2025!", "newPassword": "abc"})
check("password under 6 chars rejected",
      short[0] == 400, str(short)[:160])

print()
passed = sum(results); total = len(results)
print(f"  Passed: {passed} / {total}    Failed: {total - passed}")
sys.exit(0 if passed == total else 1)
