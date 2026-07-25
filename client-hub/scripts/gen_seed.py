#!/usr/bin/env python3
"""Generate a fully synthetic, realistic demo dataset for the Client Hub app.

No real customer data is used or read. Distributions (statuses, lead sources,
appliance brands, money ranges, geography) mirror the shape of a real
Housecall Pro export so the demo looks authentic in portfolio screenshots.
"""
import json, random, os

random.seed(7)  # deterministic output

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "seed.json")

GEO = [
    ("Tampa", "FL", ["33602", "33606", "33629", "33611"]),
    ("Charlotte", "NC", ["28202", "28205", "28211", "28277"]),
    ("Rock Hill", "SC", ["29730", "29732"]),
    ("Atlanta", "GA", ["30305", "30327", "30342", "30319"]),
    ("Jacksonville", "FL", ["32204", "32207", "32256"]),
    ("Miami", "FL", ["33131", "33133", "33156"]),
    ("Alpharetta", "GA", ["30004", "30009"]),
]
LEAD_BY_CITY = {
    "Tampa": "Tampa LSA", "Charlotte": "Charlotte LSA", "Rock Hill": "Charlotte LSA",
    "Atlanta": "Atlanta LSA", "Jacksonville": "Jacksonville LSA", "Miami": "Miami LSA",
    "Alpharetta": "Atlanta LSA",
}
OTHER_LEADS = ["Reserve with Google", "Online Booking", "northline.com", "Email Marketing 2026"]

APPLIANCES = {
    "Dishwasher": ["Bosch", "KitchenAid", "Frigidaire", "Whirlpool", "Miele"],
    "Refrigerator": ["Sub-Zero", "LG", "Samsung", "GE", "Whirlpool"],
    "Washer": ["Whirlpool", "Maytag", "Samsung", "LG", "Speed Queen"],
    "Dryer": ["Samsung", "Maytag", "LG", "Whirlpool", "Electrolux"],
    "Oven / Range": ["Wolf", "Thermador", "GE", "Viking", "KitchenAid"],
    "Cooktop": ["Wolf", "Bosch", "Thermador", "GE"],
    "Ice Maker": ["Sub-Zero", "Scotsman", "U-Line"],
    "Microwave": ["GE", "Samsung", "Panasonic"],
}
SYMPTOMS = {
    "Dishwasher": ["not draining, standing water in the tub", "not cleaning dishes, cloudy residue", "leaking from the door seal", "won't start, blinking light"],
    "Refrigerator": ["not cooling, freezer still cold", "water leaking onto the floor", "ice maker stopped producing", "loud buzzing from the compressor"],
    "Washer": ["won't spin, clothes soaked", "leaking during fill", "loud banging on spin cycle", "won't drain, error code E4"],
    "Dryer": ["not heating, clothes stay damp", "rattling noise and burning smell", "drum won't turn", "takes 3 cycles to dry"],
    "Oven / Range": ["oven won't reach temperature", "one burner won't ignite", "self-clean door locked shut", "F1 error on the display"],
    "Cooktop": ["front burner clicking, won't light", "surface element stays on high", "cracked glass surface"],
    "Ice Maker": ["not making ice at all", "ice tastes off, slow production"],
    "Microwave": ["turntable not turning, no heat", "sparking inside the cavity"],
}
FIRST = ["James", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "David", "Linda", "William", "Elizabeth",
         "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Karen", "Chris", "Nancy", "Daniel", "Lisa",
         "Matthew", "Betty", "Anthony", "Sandra", "Mark", "Ashley", "Donald", "Kimberly", "Steven", "Emily",
         "Paul", "Donna", "Andrew", "Michelle", "Joshua", "Carol", "Kevin", "Amanda", "Brian", "Deborah"]
LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
        "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
        "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]
STREETS = ["Oakwood Dr", "Maple Ave", "Sunset Blvd", "Birchwood Ln", "Palmetto St", "Harbor View Rd",
           "Magnolia Ct", "Riverside Dr", "Camden Way", "Ashford Pl", "Willow Bend", "Highland Ave",
           "Sycamore St", "Cypress Point", "Brookhaven Dr", "Lakeshore Dr", "Peachtree Rd", "Bayshore Blvd"]
# Fictional, gender-neutral technician handles — not real people.
TECHS = ["Alex R.", "Sam T.", "Jordan P.", "Casey L.", "Morgan D."]

# work_status distribution (from real export shape)
STATUS_WEIGHTS = [
    ("complete rated", 14), ("complete unrated", 26), ("scheduled", 16),
    ("in progress", 9), ("needs scheduling", 15), ("user canceled", 14), ("pro canceled", 6),
]
STAGES = {  # map work_status -> pipeline stage label + order
    "needs scheduling": ("New Lead", 0),
    "scheduled": ("Scheduled", 1),
    "in progress": ("In Progress", 2),
    "complete unrated": ("Completed", 3),
    "complete rated": ("Completed", 3),
    "user canceled": ("Canceled", 4),
    "pro canceled": ("Canceled", 4),
}

def phone():
    return f"({random.choice(['813','704','470','904','305','678'])}) {random.randint(200,989)}-{random.randint(1000,9999)}"

def money():
    return random.choice([0, 0, 89, 129, 149, 179, 189, 219, 249, 289, 329, 349, 389, 420, 480, 540, 620, 680, 940, 1240])

def pick_status():
    pool = []
    for s, w in STATUS_WEIGHTS:
        pool += [s] * w
    return random.choice(pool)

def iso(days_ago):
    # deterministic pseudo-date string relative to a fixed "today"
    base_year, base_month = 2026, 7
    day = 25 - (days_ago % 25)
    month = base_month - (days_ago // 25)
    year = base_year
    if month < 1:
        month += 12; year -= 1
    return f"{year}-{month:02d}-{max(1,day):02d}"

clients = []
jobs = []
tasks = []
cid = 0
for i in range(46):
    cid += 1
    fn, ln = random.choice(FIRST), random.choice(LAST)
    city, state, zips = random.choice(GEO)
    lead = LEAD_BY_CITY[city] if random.random() < 0.62 else random.choice(OTHER_LEADS)
    client_id = f"c{cid:03d}"
    njobs = random.choices([1, 1, 1, 1, 2, 3], k=1)[0]
    client_jobs = []
    lifetime = 0
    outstanding = 0
    for j in range(njobs):
        appliance = random.choice(list(APPLIANCES.keys()))
        brand = random.choice(APPLIANCES[appliance])
        status = pick_status()
        stage_label, stage_order = STAGES[status]
        amt = money() if status not in ("needs scheduling",) else 0
        if status in ("user canceled", "pro canceled"):
            amt = 0
        paid = status.startswith("complete") and random.random() < 0.72
        out = 0 if paid else (amt if status.startswith("complete") else 0)
        days = random.randint(0, 120)
        job = {
            "id": f"j{cid:03d}_{j}",
            "clientId": client_id,
            "appliance": appliance,
            "brand": brand,
            "description": f"{brand} {appliance.lower()} — {random.choice(SYMPTOMS[appliance])}",
            "status": status,
            "stage": stage_label,
            "stageOrder": stage_order,
            "amount": amt,
            "outstanding": out,
            "tech": random.choice(TECHS) if stage_order >= 1 and stage_order <= 3 else None,
            "scheduledDate": iso(days) if status in ("scheduled", "in progress") else None,
            "completedDate": iso(days) if status.startswith("complete") else None,
            "createdDate": iso(days + random.randint(1, 10)),
            "rating": random.choice([5, 5, 5, 4, 5]) if status == "complete rated" else None,
        }
        lifetime += amt
        outstanding += out
        client_jobs.append(job)
        jobs.append(job)

    # client pipeline position: active work first, else completed, else canceled
    statuses = {jb["status"] for jb in client_jobs}
    if "in progress" in statuses:
        latest_stage = ("In Progress", 2)
    elif "scheduled" in statuses:
        latest_stage = ("Scheduled", 1)
    elif "needs scheduling" in statuses:
        latest_stage = ("New Lead", 0)
    elif statuses & {"complete unrated", "complete rated"}:
        latest_stage = ("Completed", 3)
    else:
        latest_stage = ("Canceled", -1)

    # derive tasks
    for jb in client_jobs:
        if jb["outstanding"] > 0:
            tasks.append({"id": f"t_bal_{jb['id']}", "type": "balance", "clientId": client_id,
                          "title": f"Collect ${jb['outstanding']} balance", "sub": f"{jb['brand']} {jb['appliance']}",
                          "clientName": f"{fn} {ln}", "amount": jb["outstanding"], "due": "Overdue"})
        if jb["status"] == "complete unrated":
            tasks.append({"id": f"t_rev_{jb['id']}", "type": "review", "clientId": client_id,
                          "title": "Ask for a Google review", "sub": f"{jb['brand']} {jb['appliance']} · rated 0",
                          "clientName": f"{fn} {ln}", "due": "Today"})
        if jb["status"] == "needs scheduling":
            tasks.append({"id": f"t_sch_{jb['id']}", "type": "schedule", "clientId": client_id,
                          "title": "Schedule the visit", "sub": jb["description"][:46],
                          "clientName": f"{fn} {ln}", "due": "ASAP"})
        if jb["status"] in ("user canceled", "pro canceled"):
            tasks.append({"id": f"t_win_{jb['id']}", "type": "winback", "clientId": client_id,
                          "title": "Win back — follow up on cancel", "sub": f"{jb['brand']} {jb['appliance']}",
                          "clientName": f"{fn} {ln}", "due": "This week"})

    clients.append({
        "id": client_id,
        "firstName": fn, "lastName": ln, "name": f"{fn} {ln}",
        "phone": phone(),
        "email": f"{fn.lower()}.{ln.lower()}@example.com",
        "street": f"{random.randint(100,8999)} {random.choice(STREETS)}",
        "city": city, "state": state, "zip": random.choice(zips),
        "leadSource": lead,
        "kind": random.choice(["homeowner", "homeowner", "homeowner", "property manager"]),
        "since": iso(random.randint(30, 400)),
        "lifetimeValue": lifetime,
        "outstanding": outstanding,
        "stage": latest_stage[0],
        "stageOrder": latest_stage[1],
        "jobCount": len(client_jobs),
        "jobs": client_jobs,
        "tags": sorted({jb["brand"] for jb in client_jobs} | {jb["appliance"] for jb in client_jobs}),
    })

# KPI rollups for the dashboard
lead_counts = {}
for c in clients:
    lead_counts[c["leadSource"]] = lead_counts.get(c["leadSource"], 0) + 1

kpis = {
    "revenue": sum(j["amount"] for j in jobs),
    "outstanding": sum(j["outstanding"] for j in jobs),
    "openJobs": sum(1 for j in jobs if j["stageOrder"] in (0, 1, 2)),
    "completed": sum(1 for j in jobs if j["stage"] == "Completed"),
    "clients": len(clients),
    "jobs": len(jobs),
    "avgTicket": round(sum(j["amount"] for j in jobs if j["amount"]) / max(1, sum(1 for j in jobs if j["amount"]))),
    "leadSources": sorted(lead_counts.items(), key=lambda x: -x[1]),
    "reviewsPending": sum(1 for t in tasks if t["type"] == "review"),
}

data = {"clients": clients, "jobs": jobs, "tasks": tasks, "kpis": kpis}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(data, f, indent=1)
print(f"wrote {OUT}")
print(f"clients={len(clients)} jobs={len(jobs)} tasks={len(tasks)} revenue=${kpis['revenue']:,} outstanding=${kpis['outstanding']:,}")
