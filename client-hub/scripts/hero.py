#!/usr/bin/env python3
"""Build a portfolio hero composite for Client Hub: 4 device screenshots on a
cool graphite stage that matches the app's field-ops-console identity.
Self-contained HTML with embedded PNGs -> headless Chrome -> hero.png.
Run after shoot.sh."""
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "screenshots"
PANELS = ["01-home", "05-client-detail", "03-board", "02-clients"]


def data_uri(name: str) -> str:
    b = (SHOTS / f"{name}.png").read_bytes()
    return "data:image/png;base64," + base64.b64encode(b).decode()


imgs = "\n".join(f'<img class="dev" src="{data_uri(n)}" alt="{n}" />' for n in PANELS)

html = f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html,body {{ background:transparent; }}
  .stage {{
    width:1760px; padding:70px 60px 80px;
    background:
      radial-gradient(1200px 500px at 20% -10%, rgba(226,87,12,0.16) 0%, rgba(226,87,12,0) 60%),
      linear-gradient(140deg,#171B22 0%,#1F252E 48%,#2B333F 100%);
    border-radius:40px;
    font-family:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  }}
  .head {{ text-align:center; margin-bottom:40px; }}
  .tag {{
    display:inline-block; font-size:15px; letter-spacing:3px; text-transform:uppercase;
    color:#F6A567; border:1px solid rgba(246,165,103,0.4); border-radius:4px;
    padding:6px 12px; margin-bottom:20px;
  }}
  .title {{
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
    font-size:58px; font-weight:800; color:#F4F6F9; letter-spacing:-1px;
  }}
  .sub {{ font-size:20px; color:#8E99A8; margin-top:12px; letter-spacing:0.5px; }}
  .row {{ display:flex; justify-content:center; align-items:flex-start; gap:18px; }}
  .dev {{ width:400px; height:auto; filter:drop-shadow(0 28px 54px rgba(0,0,0,0.45)); }}
  .dev:nth-child(odd) {{ margin-top:26px; }}
</style></head>
<body>
  <div class="stage">
    <div class="head">
      <div class="tag">Field-Ops CRM</div>
      <div class="title">Client Hub</div>
      <div class="sub">Phone-first field-service CRM — React Native · Expo · TypeScript</div>
    </div>
    <div class="row">{imgs}</div>
  </div>
</body></html>"""

out = SHOTS / "_hero.html"
out.write_text(html)
print(f"wrote {out} ({len(html)//1024} KB)")
