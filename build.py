"""Build a portable page using the bundled Three.js modules and audio."""
import base64
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
source = root / "src"
vendor = root / "vendor"


def encoded(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")


imports = {}
for module in sorted(vendor.rglob("*.js")):
    key = "three" if module.parent == vendor else "three/" + module.relative_to(vendor).as_posix()
    imports[key] = "data:text/javascript;base64," + encoded(module)

audio = []
for path in sorted((root / "assets").glob("coffee-audio-*")):
    audio.append(f'<script type="application/octet-stream" id="{path.stem}">{encoded(path)}</script>')
parts = ["imports.js", "geometry.js", "sound.js", "bookreader.js", "cafe.js", "street.js", "app.js"]
page = (source / "page.html").read_text()
slots = {
    "update": (source / "update.js").read_text(),
    "styles": (source / "page.css").read_text() + "\n" + (source / "bookreader.css").read_text(),
    "libraries": json.dumps({"imports": imports}, separators=(",", ":")),
    "reader": (source / "bookreader.html").read_text(),
    "audio": "\n".join(audio),
    "code": "\n".join((source / name).read_text() for name in parts),
    "credits": (vendor / "LICENSE").read_text() + "\n" + (root / "assets/CREDITS.txt").read_text(),
}
for key, value in slots.items():
    marker = "@@" + key + "@@"
    assert page.count(marker) == 1, marker
    page = page.replace(marker, value)
assert page.count("@@build@@") == 1
build_id = hashlib.sha256(page.encode("utf-8")).hexdigest()[:16]
page = page.replace("@@build@@", build_id)
out = root / "index.html"
out.parent.mkdir(exist_ok=True)
tmp = out.with_suffix(".tmp")
tmp.write_text(page)
tmp.replace(out)
(root / "version.json").write_text(json.dumps({"build": build_id}) + "\n")
print(out, out.stat().st_size, "bytes", build_id)
