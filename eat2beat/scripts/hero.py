#!/usr/bin/env python3
"""Build a portfolio hero composite: 4 device screenshots on a soft gradient.

Embeds the PNGs as data URIs into a self-contained HTML, which headless Chrome
then renders to screenshots/hero.png. Run after shoot.sh.
"""
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "screenshots"
# order shown left -> right in the hero
PANELS = ["01-today", "04-trends", "07-weight", "09-today-dark"]


def data_uri(name: str) -> str:
    b = (SHOTS / f"{name}.png").read_bytes()
    return "data:image/png;base64," + base64.b64encode(b).decode()


imgs = "\n".join(
    f'<img class="dev" src="{data_uri(n)}" alt="{n}" />' for n in PANELS
)

html = f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html,body {{ background:transparent; }}
  .stage {{
    width:1760px; padding:70px 60px 80px;
    background:linear-gradient(135deg,#E4F5EC 0%,#F4F7F5 45%,#E2F2FB 100%);
    border-radius:40px;
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
  }}
  .head {{ text-align:center; margin-bottom:40px; }}
  .title {{ font-size:56px; font-weight:800; color:#0F1A16; letter-spacing:-1px; }}
  .title .beat {{
    background:linear-gradient(135deg,#0F9E6E,#2FD3A6);
    -webkit-background-clip:text; background-clip:text; color:transparent;
  }}
  .sub {{ font-size:23px; color:#5E6B65; margin-top:10px; font-weight:500; }}
  .row {{ display:flex; justify-content:center; align-items:flex-start; gap:18px; }}
  .dev {{ width:400px; height:auto; filter:drop-shadow(0 24px 48px rgba(11,45,34,0.22)); }}
  .dev:nth-child(odd) {{ margin-top:26px; }}
</style></head>
<body>
  <div class="stage">
    <div class="head">
      <div class="title">Eat<span class="beat">2</span>Beat</div>
      <div class="sub">Calorie &amp; macro tracker — React Native · Expo · TypeScript</div>
    </div>
    <div class="row">{imgs}</div>
  </div>
</body></html>"""

out = ROOT / "screenshots" / "_hero.html"
out.write_text(html)
print(f"wrote {out} ({len(html)//1024} KB)")
