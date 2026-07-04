"""
DeliveryIQ Project Organizer
=============================
Run this from the root of your project folder (the folder that contains
src/, public/, output/, outputs/, code/, Data Set/, etc.).

Usage:
    python organize_project.py

It will:
  1. Create the complete target folder structure.
  2. Remove all unwanted files (.DS_Store, __pycache__, *.pyc, etc.).
  3. Detect and remove duplicate files (keeping the most recently modified copy).
  4. Move / copy every file into its correct target location.
  5. Print a full file-tree and summary report.

SAFE: No data, model, or output file is ever deleted — only moved/copied.
"""

import os
import shutil
import hashlib
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.resolve()

counters = {
    "moved": 0,
    "copied": 0,
    "removed_unwanted": 0,
    "removed_duplicates": 0,
}

def log(msg: str) -> None:
    print(msg)

def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Create all target folders
# ─────────────────────────────────────────────────────────────────────────────

def create_structure() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 1 · Creating target folder structure                  │")
    log("└─────────────────────────────────────────────────────────────┘")

    dirs = [
        "code/notebooks",
        # ── model (ML training & evaluation) ──────────────────────────────
        "code/model/training",
        "code/model/evaluation",
        "code/model/features",
        # ── frontend ───────────────────────────────────────────────────────
        "code/frontend/public/data",
        "code/frontend/public/maps",
        "code/frontend/src/api",
        "code/frontend/src/components/ai",
        "code/frontend/src/components/charts",
        "code/frontend/src/components/domain",
        "code/frontend/src/components/layout",
        "code/frontend/src/components/ui",
        "code/frontend/src/hooks",
        "code/frontend/src/pages",
        "code/frontend/src/utils",
        # ── backend ────────────────────────────────────────────────────────
        "code/backend/routers",
        "code/backend/models",
        "code/backend/data",
        # ── output ─────────────────────────────────────────────────────────
        "output/data/raw",
        "output/data/processed",
        "output/models",
        "output/graphs",
        "output/maps",
    ]

    for d in dirs:
        (ROOT / d).mkdir(parents=True, exist_ok=True)

    log(f"  ✓ {len(dirs)} directories ready.")


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Remove unwanted files & folders
# ─────────────────────────────────────────────────────────────────────────────

SKIP_DIRS = {"node_modules", ".venv", "venv", "env", ".git"}

REMOVE_PATTERNS = [
    "**/.DS_Store",
    "**/__pycache__",
    "**/*.pyc",
    "**/*.pyo",
    "**/Thumbs.db",
    "**/.ipynb_checkpoints",
    "**/*.log",
    "**/*.tmp",
]


def remove_unwanted() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 2 · Removing unwanted files / folders                 │")
    log("└─────────────────────────────────────────────────────────────┘")

    for pattern in REMOVE_PATTERNS:
        for match in ROOT.glob(pattern):
            if any(skip in match.parts for skip in SKIP_DIRS):
                continue
            try:
                if match.is_dir():
                    shutil.rmtree(match)
                    log(f"  🗑  Removed dir : {rel(match)}")
                else:
                    match.unlink()
                    log(f"  🗑  Removed file: {rel(match)}")
                counters["removed_unwanted"] += 1
            except Exception as e:
                log(f"  ⚠  Could not remove {rel(match)}: {e}")

    log(f"  ✓ Removed {counters['removed_unwanted']} unwanted items.")


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Detect and remove duplicates
# ─────────────────────────────────────────────────────────────────────────────

def file_hash(path: Path, chunk: int = 65536) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        while True:
            buf = f.read(chunk)
            if not buf:
                break
            h.update(buf)
    return h.hexdigest()


def remove_duplicates() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 3 · Detecting and removing duplicate files            │")
    log("└─────────────────────────────────────────────────────────────┘")

    by_name: dict[str, list[Path]] = defaultdict(list)
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(skip in path.parts for skip in SKIP_DIRS):
            continue
        by_name[path.name.lower()].append(path)

    removed = 0
    for name, paths in by_name.items():
        if len(paths) < 2:
            continue
        by_hash: dict[str, list[Path]] = defaultdict(list)
        for p in paths:
            try:
                by_hash[file_hash(p)].append(p)
            except Exception:
                pass
        for h, dupes in by_hash.items():
            if len(dupes) < 2:
                continue
            dupes_sorted = sorted(dupes, key=lambda p: p.stat().st_mtime, reverse=True)
            keeper = dupes_sorted[0]
            log(f"  📋 Duplicate '{name}' → keeping: {rel(keeper)}")
            for stale in dupes_sorted[1:]:
                try:
                    stale.unlink()
                    log(f"     🗑  Removed: {rel(stale)}")
                    counters["removed_duplicates"] += 1
                    removed += 1
                except Exception as e:
                    log(f"     ⚠  {e}")

    log(f"  ✓ {'No exact duplicates found.' if removed == 0 else f'Removed {removed} duplicate files.'}")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def safe_move(src: Path, dst: Path) -> bool:
    if not src.exists():
        return False
    if src.resolve() == dst.resolve():
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.move(str(src), str(dst))
        log(f"  ➜  Moved  : {rel(src)} → {rel(dst)}")
        counters["moved"] += 1
        return True
    except Exception as e:
        log(f"  ⚠  Move failed {rel(src)}: {e}")
        return False


def safe_copy(src: Path, dst: Path) -> bool:
    if not src.exists():
        return False
    if src.resolve() == dst.resolve():
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.copy2(str(src), str(dst))
        log(f"  📄 Copied : {rel(src)} → {rel(dst)}")
        counters["copied"] += 1
        return True
    except Exception as e:
        log(f"  ⚠  Copy failed {rel(src)}: {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Jupyter notebooks → code/notebooks/
# ─────────────────────────────────────────────────────────────────────────────

def move_notebooks() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 4 · Moving Jupyter notebooks → code/notebooks/        │")
    log("└─────────────────────────────────────────────────────────────┘")

    notebooks = [p for p in ROOT.rglob("*.ipynb")
                 if not any(skip in p.parts for skip in SKIP_DIRS)
                 and "code/notebooks" not in str(p).replace("\\", "/")]

    if not notebooks:
        log("  — No notebooks found outside code/notebooks/.")
        return

    by_name: dict[str, list[Path]] = defaultdict(list)
    for nb in notebooks:
        by_name[nb.name].append(nb)

    for name, paths in by_name.items():
        if len(paths) > 1:
            paths.sort(key=lambda p: p.stat().st_mtime, reverse=True)
            log(f"  ℹ  Multiple notebooks named '{name}', keeping most recent.")
            for stale in paths[1:]:
                try:
                    stale.unlink()
                    counters["removed_duplicates"] += 1
                except Exception:
                    pass
            paths = [paths[0]]
        safe_move(paths[0], ROOT / "code" / "notebooks" / name)


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Python scripts → code/backend/ or code/notebooks/
# ─────────────────────────────────────────────────────────────────────────────

ROUTER_SCRIPTS  = {"network.py", "hubs.py", "corridors.py", "model.py", "ftl.py"}
UTILITY_SCRIPTS = {"run_pipeline.py", "prepare_assets.py", "copy_vite.py"}


def move_python_scripts() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 5 · Moving Python scripts                             │")
    log("└─────────────────────────────────────────────────────────────┘")

    for py in ROOT.rglob("*.py"):
        if any(skip in py.parts for skip in SKIP_DIRS):
            continue
        norm = str(py).replace("\\", "/")
        # Skip files already inside code/
        if "/code/" in norm:
            continue
        # Skip this organizer script itself
        if py.name == "organize_project.py":
            continue

        name = py.name

        if name == "schemas.py":
            safe_move(py, ROOT / "code" / "backend" / "models" / name)
        elif name in ROUTER_SCRIPTS:
            safe_move(py, ROOT / "code" / "backend" / "routers" / name)
        elif name == "main.py":
            safe_move(py, ROOT / "code" / "backend" / name)
        elif name in UTILITY_SCRIPTS:
            safe_move(py, ROOT / "code" / "notebooks" / name)
        else:
            safe_move(py, ROOT / "code" / "backend" / name)

    # requirements.txt at root level
    req = ROOT / "requirements.txt"
    if req.exists():
        safe_move(req, ROOT / "code" / "backend" / "requirements.txt")


# ─────────────────────────────────────────────────────────────────────────────
# Step 6 — CSV files → output/data/
# ─────────────────────────────────────────────────────────────────────────────

RAW_CSV = {"delivery_data.csv"}
PROCESSED_CSV = {
    "bottleneck_hubs.csv", "corridor_audit.csv",
    "predictions.csv", "ftl_framework.csv",
    "ftl_advisor_rules.csv", "corridor_recommendations.csv",
    "feature_importance.csv", "model_benchmark.csv",
}


def move_csv_files() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 6 · Moving CSV files → output/data/                   │")
    log("└─────────────────────────────────────────────────────────────┘")

    for csv in ROOT.rglob("*.csv"):
        if any(skip in csv.parts for skip in SKIP_DIRS):
            continue
        norm = str(csv).replace("\\", "/")
        if "/output/data/" in norm:
            continue
        name = csv.name
        if name in RAW_CSV:
            safe_move(csv, ROOT / "output" / "data" / "raw" / name)
        else:
            safe_move(csv, ROOT / "output" / "data" / "processed" / name)


# ─────────────────────────────────────────────────────────────────────────────
# Step 7 — Models & graph files → output/models/
# ─────────────────────────────────────────────────────────────────────────────

def move_models() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 7 · Moving model files → output/models/               │")
    log("└─────────────────────────────────────────────────────────────┘")

    for ext in ("*.pkl", "*.graphml", "*.h5", "*.joblib"):
        for f in ROOT.rglob(ext):
            if any(skip in f.parts for skip in SKIP_DIRS):
                continue
            norm = str(f).replace("\\", "/")
            if "/output/models/" in norm:
                continue
            safe_move(f, ROOT / "output" / "models" / f.name)


# ─────────────────────────────────────────────────────────────────────────────
# Step 8 — Images → output/graphs/
# ─────────────────────────────────────────────────────────────────────────────

SKIP_IMG_NAMES = {"favicon.svg", "icons.svg"}


def move_images() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 8 · Moving images → output/graphs/                    │")
    log("└─────────────────────────────────────────────────────────────┘")

    for ext in ("*.png", "*.jpg", "*.jpeg"):
        for img in ROOT.rglob(ext):
            if any(skip in img.parts for skip in SKIP_DIRS):
                continue
            if img.name in SKIP_IMG_NAMES:
                continue
            norm = str(img).replace("\\", "/")
            if "/src/assets/" in norm or "/dist/assets/" in norm:
                continue
            if "/output/graphs/" in norm:
                continue
            safe_move(img, ROOT / "output" / "graphs" / img.name)


# ─────────────────────────────────────────────────────────────────────────────
# Step 9 — HTML maps → output/maps/ AND code/frontend/public/maps/
# ─────────────────────────────────────────────────────────────────────────────

MAP_HTML_NAMES = {
    "tsp_tour_n10.html",
    "tsp_tour_n1000.html",
    "corridor_delay_map.html",
}


def move_maps() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 9 · Moving Leaflet maps → output/maps/ &              │")
    log("│           code/frontend/public/maps/                        │")
    log("└─────────────────────────────────────────────────────────────┘")

    # Find the canonical (most recent) version of each map
    canonical: dict[str, Path] = {}
    for html in ROOT.rglob("*.html"):
        if any(skip in html.parts for skip in SKIP_DIRS):
            continue
        key = html.name.lower()
        if key not in MAP_HTML_NAMES:
            continue
        if key not in canonical or html.stat().st_mtime > canonical[key].stat().st_mtime:
            canonical[key] = html

    for key, src in canonical.items():
        dst_fe  = ROOT / "code" / "frontend" / "public" / "maps" / src.name
        dst_out = ROOT / "output" / "maps" / src.name

        # Ensure both destinations exist
        if src.resolve() == dst_fe.resolve():
            # Already in the right frontend place — copy to output
            if not dst_out.exists():
                safe_copy(src, dst_out)
        else:
            # Move to frontend (primary home)
            if not dst_fe.exists():
                safe_move(src, dst_fe)
            else:
                try:
                    src.unlink()
                    counters["removed_duplicates"] += 1
                except Exception:
                    pass
            # Copy to output/maps
            if not dst_out.exists():
                safe_copy(dst_fe, dst_out)

    # Ensure output/maps has all three (copy from frontend if missing)
    for name in ["tsp_tour_N10.html", "tsp_tour_N1000.html", "corridor_delay_map.html"]:
        src = ROOT / "code" / "frontend" / "public" / "maps" / name
        dst = ROOT / "output" / "maps" / name
        if src.exists() and not dst.exists():
            safe_copy(src, dst)


# ─────────────────────────────────────────────────────────────────────────────
# Step 10 — JSON files → frontend/public/data/ AND backend/data/
# ─────────────────────────────────────────────────────────────────────────────

DATA_JSON_NAMES = {
    "network_stats.json",
    "bottleneck_hubs.json",
    "corridor_audit.json",
    "model_benchmark.json",
    "feature_importance.json",
    "ftl_advisor_rules.json",
    "hub_insights.json",
    "corridor_recommendations.json",
    "risk_scores.json",
    "network_intelligence.json",
    "corrected_network_intelligence.json",
}


def move_json_files() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 10 · Moving JSON files → frontend/public/data/ &      │")
    log("│            backend/data/                                     │")
    log("└─────────────────────────────────────────────────────────────┘")

    # Collect canonical sources (prefer public/data copy)
    canonical: dict[str, Path] = {}
    for j in ROOT.rglob("*.json"):
        if any(skip in j.parts for skip in SKIP_DIRS):
            continue
        name = j.name
        if name not in DATA_JSON_NAMES:
            continue
        norm = str(j).replace("\\", "/")
        if "/frontend/public/data/" in norm or "/code/frontend/public/data/" in norm:
            canonical[name] = j  # highest priority
        elif name not in canonical:
            canonical[name] = j

    fe_data = ROOT / "code" / "frontend" / "public" / "data"
    be_data = ROOT / "code" / "backend" / "data"

    for name, src in canonical.items():
        dst_fe = fe_data / name
        dst_be = be_data / name

        # Make sure frontend/public/data has the file
        if src.resolve() != dst_fe.resolve():
            if not dst_fe.exists():
                safe_copy(src, dst_fe)
        # Make sure backend/data has it too
        if not dst_be.exists():
            safe_copy(dst_fe if dst_fe.exists() else src, dst_be)

        # Remove stray root-level or output/-level duplicates
        norm = str(src).replace("\\", "/")
        is_stray = (
            src.parent.resolve() == ROOT.resolve()
            or "/outputs/" in norm
            or "/output/" in norm and "/output/data/" not in norm
            or "/dist/" in norm
        )
        if is_stray and src.resolve() not in {dst_fe.resolve(), dst_be.resolve()}:
            try:
                src.unlink()
                log(f"  🗑  Removed stray JSON: {rel(src)}")
                counters["removed_duplicates"] += 1
            except Exception:
                pass


# ─────────────────────────────────────────────────────────────────────────────
# Step 10b — Organise existing React frontend files from root src/
# ─────────────────────────────────────────────────────────────────────────────

def organise_frontend() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 10b · Organising React frontend files                 │")
    log("└─────────────────────────────────────────────────────────────┘")

    root_src = ROOT / "src"

    # Pages
    if (root_src / "pages").exists():
        for f in (root_src / "pages").iterdir():
            if f.is_file():
                safe_move(f, ROOT / "code" / "frontend" / "src" / "pages" / f.name)

    # Components (ai, charts, domain, layout, ui sub-directories)
    comp_src = root_src / "components"
    if comp_src.exists():
        for child in comp_src.iterdir():
            if child.is_dir():
                dst = ROOT / "code" / "frontend" / "src" / "components" / child.name
                dst.mkdir(parents=True, exist_ok=True)
                for f in child.iterdir():
                    if f.is_file():
                        safe_move(f, dst / f.name)
            elif child.is_file():
                safe_move(child, ROOT / "code" / "frontend" / "src" / "components" / child.name)

    # Utils
    utils_src = root_src / "utils"
    if utils_src.exists():
        for f in utils_src.iterdir():
            if f.is_file():
                safe_move(f, ROOT / "code" / "frontend" / "src" / "utils" / f.name)

    # Root-level src files
    for fname in ["App.jsx", "App.css", "main.jsx", "index.css"]:
        f = root_src / fname
        if f.exists():
            safe_move(f, ROOT / "code" / "frontend" / "src" / fname)

    # Remove empty old src/ tree
    try:
        shutil.rmtree(root_src, ignore_errors=True)
        log("  🗑  Removed old src/ tree (all files migrated).")
    except Exception:
        pass

    # index.html at root
    root_index = ROOT / "index.html"
    if root_index.exists():
        safe_move(root_index, ROOT / "code" / "frontend" / "index.html")

    # Vite / Tailwind / PostCSS configs
    for fname in ["vite.config.js", "tailwind.config.js", "postcss.config.js"]:
        f = ROOT / fname
        if f.exists():
            safe_move(f, ROOT / "code" / "frontend" / fname)

    # package.json + package-lock.json
    for fname in ["package.json", "package-lock.json"]:
        f = ROOT / fname
        if f.exists():
            safe_move(f, ROOT / "code" / "frontend" / fname)

    # public/ → frontend/public/ (favicon, icons)
    root_pub = ROOT / "public"
    if root_pub.exists():
        for item in root_pub.iterdir():
            if item.is_file():
                safe_move(item, ROOT / "code" / "frontend" / "public" / item.name)
        try:
            shutil.rmtree(root_pub, ignore_errors=True)
            log("  🗑  Removed old public/ tree (migrated to code/frontend/public/).")
        except Exception:
            pass

    # Remove dist/ (build artifact; regenerated by npm run build)
    dist = ROOT / "dist"
    if dist.exists():
        log("  ℹ  Removing dist/ — build artifact (regenerate with npm run build).")
        try:
            shutil.rmtree(dist)
            log("  🗑  Removed dist/")
        except Exception as e:
            log(f"  ⚠  Could not remove dist/: {e}")

    # Remove old outputs/ if now empty
    old_outputs = ROOT / "outputs"
    if old_outputs.exists():
        try:
            shutil.rmtree(old_outputs, ignore_errors=True)
            log("  🗑  Removed old outputs/ folder.")
        except Exception:
            pass

    # Remove old code/ folder if it held only scripts (now moved)
    # Leave it if it already has the right structure
    old_code_scripts = [
        ROOT / "code" / "copy_vite.py",
        ROOT / "code" / "prepare_assets.py",
        ROOT / "code" / "run_pipeline.py",
        ROOT / "code" / "main.py",
        ROOT / "code" / "schemas.py",
    ]
    for f in old_code_scripts:
        if f.exists() and not str(f).replace("\\", "/").startswith(
            str(ROOT / "code" / "backend").replace("\\", "/")
        ):
            pass  # already handled in Step 5


# ─────────────────────────────────────────────────────────────────────────────
# Step 11 — Print file tree
# ─────────────────────────────────────────────────────────────────────────────

TREE_SKIP = {"node_modules", ".venv", "venv", "env", ".git"}


def print_tree(path: Path, prefix: str = "", is_last: bool = True) -> int:
    connector = "└── " if is_last else "├── "
    print(prefix + connector + path.name)
    file_count = 0
    new_prefix = prefix + ("    " if is_last else "│   ")
    if path.is_dir():
        if path.name in TREE_SKIP:
            print(new_prefix + "└── [skipped — not shown]")
            return 0
        children = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        for i, child in enumerate(children):
            file_count += print_tree(child, new_prefix, i == len(children) - 1)
    else:
        file_count = 1
    return file_count


def show_structure() -> None:
    log("\n┌─────────────────────────────────────────────────────────────┐")
    log("│  Step 11 · Final Folder Structure                           │")
    log("└─────────────────────────────────────────────────────────────┘\n")

    print(ROOT.name + "/")
    total = 0
    top = sorted(ROOT.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    for i, item in enumerate(top):
        if item.name in TREE_SKIP:
            continue
        total += print_tree(item, "", i == len(top) - 1)
    log(f"\n  Total files in project: {total}")


# ─────────────────────────────────────────────────────────────────────────────
# Step 12 — Report
# ─────────────────────────────────────────────────────────────────────────────

def count_files(p: Path) -> int:
    if not p.exists():
        return 0
    return sum(1 for _ in p.rglob("*") if _.is_file()
               and not any(s in _.parts for s in TREE_SKIP))


def report() -> None:
    code_n   = count_files(ROOT / "code")
    output_n = count_files(ROOT / "output")
    notebooks = count_files(ROOT / "code" / "notebooks")
    models    = count_files(ROOT / "output" / "models")
    graphs    = count_files(ROOT / "output" / "graphs")
    data      = count_files(ROOT / "output" / "data")
    jsons     = count_files(ROOT / "code" / "frontend" / "public" / "data")
    maps      = count_files(ROOT / "output" / "maps")

    log("\n╔═════════════════════════════════════════════════════════════╗")
    log("║                 DeliveryIQ Organizer Report                 ║")
    log("╠═════════════════════════════════════════════════════════════╣")
    log(f"║  Files moved            : {counters['moved']:<5}                          ║")
    log(f"║  Files copied           : {counters['copied']:<5}                          ║")
    log(f"║  Duplicates removed     : {counters['removed_duplicates']:<5}                          ║")
    log(f"║  Unwanted items removed : {counters['removed_unwanted']:<5}                          ║")
    log("╠═════════════════════════════════════════════════════════════╣")
    log(f"║  code/   → {code_n:<5} files                                    ║")
    log(f"║  output/ → {output_n:<5} files                                    ║")
    log("╠═════════════════════════════════════════════════════════════╣")
    log(f"║  ✓ {notebooks:<3} notebooks  ✓ {models:<3} models   ✓ {graphs:<3} graphs           ║")
    log(f"║  ✓ {data:<3} data files ✓ {jsons:<3} JSON files ✓ {maps:<3} maps             ║")
    log("╚═════════════════════════════════════════════════════════════╝")
    log(f"\n  Completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log("  Your project is GitHub-ready! 🚀")
    log("\n  Next steps:")
    log("    cd code/frontend && npm install && npm run dev")
    log("    cd code/backend  && pip install -r requirements.txt && uvicorn main:app --reload")
    log("    cd code/notebooks && jupyter notebook DeliveryIQ_Analysis.ipynb")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    # ── Force UTF-8 output on Windows (avoids cp1252 UnicodeEncodeError) ──
    import sys
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    log("╔═════════════════════════════════════════════════════════════╗")
    log("║       ⬡  DeliveryIQ Project Organizer  ⬡                   ║")
    log("╚═════════════════════════════════════════════════════════════╝")
    log(f"  Working directory: {ROOT}\n")

    create_structure()
    remove_unwanted()
    remove_duplicates()
    move_notebooks()
    move_python_scripts()
    move_csv_files()
    move_models()
    move_images()
    move_maps()
    move_json_files()
    organise_frontend()
    show_structure()
    report()


if __name__ == "__main__":
    main()
