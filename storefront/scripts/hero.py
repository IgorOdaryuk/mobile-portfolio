#!/usr/bin/env python3
"""Build a portfolio hero composite for Solva: 4 device screenshots on a warm
gradient. Self-contained HTML with embedded PNGs -> headless Chrome -> hero.png.
Run after shoot.sh."""
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "screenshots"
PANELS = ["01-shop", "02-product", "04-cart", "07-shop-dark"]


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
    background:linear-gradient(135deg,#E5ECE5 0%,#F6F2EC 46%,#F3E1D7 100%);
    border-radius:40px;
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
  }}
  .head {{ text-align:center; margin-bottom:40px; }}
  .title {{ font-size:56px; font-weight:800; color:#26221D; letter-spacing:0.5px; }}
  .sub {{ font-size:23px; color:#6E655A; margin-top:10px; font-weight:500; }}
  .row {{ display:flex; justify-content:center; align-items:flex-start; gap:18px; }}
  .dev {{ width:400px; height:auto; filter:drop-shadow(0 24px 48px rgba(38,34,29,0.20)); }}
  .dev:nth-child(odd) {{ margin-top:26px; }}
</style></head>
<body>
  <div class="stage">
    <div class="head">
      <div class="title">Solva</div>
      <div class="sub">Clean skincare storefront — React Native · Expo · TypeScript</div>
    </div>
    <div class="row">{imgs}</div>
  </div>
</body></html>"""

out = SHOTS / "_hero.html"
out.write_text(html)
print(f"wrote {out} ({len(html)//1024} KB)")
