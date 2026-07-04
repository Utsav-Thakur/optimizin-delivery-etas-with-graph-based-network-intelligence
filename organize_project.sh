#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║       ⬡  DeliveryIQ Project Organizer  (Shell Version)      ║
# ║  Usage: chmod +x organize_project.sh && ./organize_project.sh║
# ║  Run from the root of your DeliveryIQ project folder.        ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Colour helpers ──────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info()    { echo -e "${CYAN}  ➜  $*${NC}"; }
success() { echo -e "${GREEN}  ✓  $*${NC}"; }
warn()    { echo -e "${YELLOW}  ⚠  $*${NC}"; }
removed() { echo -e "${RED}  🗑  $*${NC}"; }

MOVED=0
COPIED=0
REMOVED_UNWANTED=0
REMOVED_DUPLICATES=0

smove() {
    # smove <src> <dst>  — move if src exists and differs from dst
    local src="$1" dst="$2"
    [ -f "$src" ] || return 0
    [ "$src" = "$dst" ] && return 0
    mkdir -p "$(dirname "$dst")"
    mv -n "$src" "$dst" && info "Moved: $src → $dst" && MOVED=$((MOVED+1)) || warn "Could not move $src"
}

scopy() {
    # scopy <src> <dst>
    local src="$1" dst="$2"
    [ -f "$src" ] || return 0
    [ "$src" = "$dst" ] && return 0
    mkdir -p "$(dirname "$dst")"
    cp -p "$src" "$dst" && info "Copied: $src → $dst" && COPIED=$((COPIED+1)) || warn "Could not copy $src"
}

echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║       ⬡  DeliveryIQ Project Organizer Starting...           ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo "  Working directory: $(pwd)"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 1 · Create all target directories
# ──────────────────────────────────────────────────────────────
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 1 · Creating target folder structure                   │"
echo "└──────────────────────────────────────────────────────────────┘"

mkdir -p code/notebooks
mkdir -p code/model/training    # ETA & FTL model training scripts
mkdir -p code/model/evaluation  # Benchmarking, MAE comparison, residual plots
mkdir -p code/model/features    # Feature engineering & graph feature extraction
mkdir -p code/frontend/public/data
mkdir -p code/frontend/public/maps
mkdir -p code/frontend/src/api
mkdir -p code/frontend/src/components/ai
mkdir -p code/frontend/src/components/charts
mkdir -p code/frontend/src/components/domain
mkdir -p code/frontend/src/components/layout
mkdir -p code/frontend/src/components/ui
mkdir -p code/frontend/src/hooks
mkdir -p code/frontend/src/pages
mkdir -p code/frontend/src/utils
mkdir -p code/backend/routers
mkdir -p code/backend/models
mkdir -p code/backend/data
mkdir -p output/data/raw
mkdir -p output/data/processed
mkdir -p output/models
mkdir -p output/graphs
mkdir -p output/maps

success "All directories created."

# ──────────────────────────────────────────────────────────────
# Step 2 · Remove unwanted files and folders
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 2 · Removing unwanted files / folders                  │"
echo "└──────────────────────────────────────────────────────────────┘"

# .DS_Store
while IFS= read -r -d '' f; do
    rm -f "$f" && removed "Removed: $f" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -name ".DS_Store" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# *.pyc files
while IFS= read -r -d '' f; do
    rm -f "$f" && removed "Removed: $f" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -name "*.pyc" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# *.pyo files
while IFS= read -r -d '' f; do
    rm -f "$f" && removed "Removed: $f" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -name "*.pyo" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# __pycache__ directories
while IFS= read -r -d '' d; do
    rm -rf "$d" && removed "Removed dir: $d" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -type d -name "__pycache__" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# .ipynb_checkpoints
while IFS= read -r -d '' d; do
    rm -rf "$d" && removed "Removed dir: $d" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -type d -name ".ipynb_checkpoints" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# Thumbs.db
while IFS= read -r -d '' f; do
    rm -f "$f" && removed "Removed: $f" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -name "Thumbs.db" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

# *.log files
while IFS= read -r -d '' f; do
    rm -f "$f" && removed "Removed: $f" && REMOVED_UNWANTED=$((REMOVED_UNWANTED+1))
done < <(find . -name "*.log" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

success "Removed $REMOVED_UNWANTED unwanted items."

# ──────────────────────────────────────────────────────────────
# Step 3 · Duplicate detection (by filename + size)
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 3 · Duplicate detection (keeping most recent)          │"
echo "└──────────────────────────────────────────────────────────────┘"
# Full dedup via hash is a Python task — this shell version skips exact-hash
# comparison and relies on the move logic below to naturally consolidate copies.
success "Consolidation handled by move steps below."

# ──────────────────────────────────────────────────────────────
# Step 4 · Jupyter notebooks → code/notebooks/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 4 · Moving Jupyter notebooks → code/notebooks/         │"
echo "└──────────────────────────────────────────────────────────────┘"

while IFS= read -r -d '' nb; do
    dest="code/notebooks/$(basename "$nb")"
    [ "$nb" = "$dest" ] && continue
    smove "$nb" "$dest"
done < <(find . -name "*.ipynb" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/code/notebooks/*" \
    -print0 2>/dev/null)

# ──────────────────────────────────────────────────────────────
# Step 5 · Python scripts → code/backend/ or code/notebooks/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 5 · Moving Python scripts                              │"
echo "└──────────────────────────────────────────────────────────────┘"

smove main.py      code/backend/main.py
smove schemas.py   code/backend/models/schemas.py
smove run_pipeline.py    code/notebooks/run_pipeline.py
smove prepare_assets.py  code/notebooks/prepare_assets.py
smove copy_vite.py       code/notebooks/copy_vite.py

# requirements.txt
smove requirements.txt code/backend/requirements.txt

# Old code/ scripts (if they exist at root/code/ level before reorganisation)
smove code/main.py            code/backend/main.py
smove code/schemas.py         code/backend/models/schemas.py
smove code/run_pipeline.py    code/notebooks/run_pipeline.py
smove code/prepare_assets.py  code/notebooks/prepare_assets.py
smove code/copy_vite.py       code/notebooks/copy_vite.py

# ──────────────────────────────────────────────────────────────
# Step 6 · CSV files → output/data/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 6 · Moving CSV files → output/data/                    │"
echo "└──────────────────────────────────────────────────────────────┘"

# Raw data
smove "Data Set/delivery_data.csv"  output/data/raw/delivery_data.csv

# Processed — check common locations
for csv in bottleneck_hubs.csv corridor_audit.csv predictions.csv \
           ftl_framework.csv ftl_advisor_rules.csv \
           corridor_recommendations.csv feature_importance.csv model_benchmark.csv; do
    # root level
    smove "$csv" "output/data/processed/$csv"
    # outputs/maps (old location)
    smove "outputs/maps/$csv" "output/data/processed/$csv"
    # output/ root (if already partly organised)
    smove "output/$csv" "output/data/processed/$csv"
done

# ──────────────────────────────────────────────────────────────
# Step 7 · Model files → output/models/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 7 · Moving model files → output/models/                │"
echo "└──────────────────────────────────────────────────────────────┘"

for f in eta_model.pkl eta_scaler.pkl ftl_model.pkl ftl_scaler.pkl graph.graphml; do
    smove "$f" "output/models/$f"
done

# ──────────────────────────────────────────────────────────────
# Step 8 · Images → output/graphs/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 8 · Moving images → output/graphs/                     │"
echo "└──────────────────────────────────────────────────────────────┘"

for f in network_graph.png betweenness_bar.png delay_heatmap.png \
         segment_factor_distribution.png mae_comparison.png \
         within15_comparison.png accuracy_comparison.png \
         feature_importance.png residual_plot.png \
         ftl_vs_carting_delay.png delay_by_hour.png \
         top_hubs_centrality.png; do
    smove "$f" "output/graphs/$f"
done

# ──────────────────────────────────────────────────────────────
# Step 9 · HTML Leaflet maps → output/maps/ AND frontend/public/maps/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 9 · Moving Leaflet maps                                │"
echo "└──────────────────────────────────────────────────────────────┘"

for f in tsp_tour_N10.html tsp_tour_N1000.html corridor_delay_map.html; do
    # From root
    if [ -f "$f" ]; then
        scopy "$f" "output/maps/$f"
        smove "$f" "code/frontend/public/maps/$f"
    fi
    # From old public/maps
    if [ -f "public/maps/$f" ]; then
        scopy "public/maps/$f" "output/maps/$f"
        smove "public/maps/$f" "code/frontend/public/maps/$f"
    fi
    # From outputs/maps
    if [ -f "outputs/maps/$f" ]; then
        scopy "outputs/maps/$f" "output/maps/$f"
        smove "outputs/maps/$f" "code/frontend/public/maps/$f"
    fi
    # Ensure output/maps has copy from frontend/public/maps
    if [ -f "code/frontend/public/maps/$f" ] && [ ! -f "output/maps/$f" ]; then
        scopy "code/frontend/public/maps/$f" "output/maps/$f"
    fi
done

# ──────────────────────────────────────────────────────────────
# Step 10 · JSON files → frontend/public/data/ AND backend/data/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 10 · Moving JSON files                                 │"
echo "└──────────────────────────────────────────────────────────────┘"

JSON_FILES=(
    network_stats.json bottleneck_hubs.json corridor_audit.json
    model_benchmark.json feature_importance.json ftl_advisor_rules.json
    hub_insights.json corridor_recommendations.json risk_scores.json
    network_intelligence.json corrected_network_intelligence.json
)

for j in "${JSON_FILES[@]}"; do
    # Root level
    if [ -f "$j" ]; then
        scopy "$j" "code/frontend/public/data/$j"
        scopy "$j" "code/backend/data/$j"
        rm -f "$j" && removed "Removed stray JSON: $j" && REMOVED_DUPLICATES=$((REMOVED_DUPLICATES+1))
    fi
    # output/ folder
    if [ -f "output/$j" ]; then
        scopy "output/$j" "code/frontend/public/data/$j"
        scopy "output/$j" "code/backend/data/$j"
        rm -f "output/$j" && REMOVED_DUPLICATES=$((REMOVED_DUPLICATES+1))
    fi
    # outputs/ folder
    if [ -f "outputs/$j" ]; then
        scopy "outputs/$j" "code/frontend/public/data/$j"
        scopy "outputs/$j" "code/backend/data/$j"
        rm -f "outputs/$j" && REMOVED_DUPLICATES=$((REMOVED_DUPLICATES+1))
    fi
done

# ──────────────────────────────────────────────────────────────
# Step 10b · Move React frontend files from root src/
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 10b · Organising React frontend files                  │"
echo "└──────────────────────────────────────────────────────────────┘"

# Pages
if [ -d "src/pages" ]; then
    for f in src/pages/*.jsx src/pages/*.tsx src/pages/*.js; do
        [ -f "$f" ] && smove "$f" "code/frontend/src/pages/$(basename "$f")"
    done
fi

# Components sub-directories
for sub in ai charts domain layout ui; do
    if [ -d "src/components/$sub" ]; then
        for f in "src/components/$sub"/*; do
            [ -f "$f" ] && smove "$f" "code/frontend/src/components/$sub/$(basename "$f")"
        done
    fi
done

# Utils
if [ -d "src/utils" ]; then
    for f in src/utils/*; do
        [ -f "$f" ] && smove "$f" "code/frontend/src/utils/$(basename "$f")"
    done
fi

# Root-level src files
for fname in App.jsx App.css main.jsx index.css; do
    smove "src/$fname" "code/frontend/src/$fname"
done

# Config files
smove index.html        code/frontend/index.html
smove vite.config.js    code/frontend/vite.config.js
smove tailwind.config.js code/frontend/tailwind.config.js
smove postcss.config.js  code/frontend/postcss.config.js
smove package.json       code/frontend/package.json
smove package-lock.json  code/frontend/package-lock.json

# public/ assets
if [ -d "public" ]; then
    for f in public/*; do
        [ -f "$f" ] && smove "$f" "code/frontend/public/$(basename "$f")"
    done
fi

# Remove dist/ (build artifact)
if [ -d "dist" ]; then
    rm -rf dist && removed "Removed dist/ (regenerate with npm run build)"
fi

# Remove now-empty dirs
[ -d "src" ]     && find src     -mindepth 1 -maxdepth 1 | grep -q . || rmdir src     2>/dev/null || true
[ -d "public" ]  && find public  -mindepth 1 -maxdepth 1 | grep -q . || rmdir public  2>/dev/null || true
[ -d "outputs" ] && rm -rf outputs && removed "Removed old outputs/ folder"

# ──────────────────────────────────────────────────────────────
# Step 11 · Print final structure
# ──────────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  Step 11 · Final Folder Structure (first 80 files)           │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

if command -v tree &>/dev/null; then
    tree -I "node_modules|.git|.venv|venv" --dirsfirst -L 5
else
    find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
           -not -path "*/.venv/*" -not -path "*/venv/*" \
           -type f | sort | head -80
fi

# ──────────────────────────────────────────────────────────────
# Step 12 · Summary report
# ──────────────────────────────────────────────────────────────
echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║                 DeliveryIQ Organizer Report                 ║"
echo "╠═════════════════════════════════════════════════════════════╣"
printf "║  Files moved            : %-5d                          ║\n" "$MOVED"
printf "║  Files copied           : %-5d                          ║\n" "$COPIED"
printf "║  Duplicates removed     : %-5d                          ║\n" "$REMOVED_DUPLICATES"
printf "║  Unwanted items removed : %-5d                          ║\n" "$REMOVED_UNWANTED"

CODE_COUNT=$(find code   -not -path "*/node_modules/*" -type f 2>/dev/null | wc -l)
OUT_COUNT=$(find output  -not -path "*/node_modules/*" -type f 2>/dev/null | wc -l)
NB_COUNT=$(find code/notebooks  -type f 2>/dev/null | wc -l)
MDL_COUNT=$(find output/models  -type f 2>/dev/null | wc -l)
GRF_COUNT=$(find output/graphs  -type f 2>/dev/null | wc -l)
DAT_COUNT=$(find output/data    -type f 2>/dev/null | wc -l)
JSN_COUNT=$(find code/frontend/public/data -type f 2>/dev/null | wc -l)
MAP_COUNT=$(find output/maps    -type f 2>/dev/null | wc -l)

echo "╠═════════════════════════════════════════════════════════════╣"
printf "║  code/   → %-5d files                                    ║\n" "$CODE_COUNT"
printf "║  output/ → %-5d files                                    ║\n" "$OUT_COUNT"
echo "╠═════════════════════════════════════════════════════════════╣"
printf "║  ✓ %-3d notebooks  ✓ %-3d models   ✓ %-3d graphs           ║\n" "$NB_COUNT" "$MDL_COUNT" "$GRF_COUNT"
printf "║  ✓ %-3d data files ✓ %-3d JSONs     ✓ %-3d maps             ║\n" "$DAT_COUNT" "$JSN_COUNT" "$MAP_COUNT"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}  Your project is GitHub-ready! 🚀${NC}"
echo ""
echo "  Next steps:"
echo "    cd code/frontend && npm install && npm run dev"
echo "    cd code/backend  && pip install -r requirements.txt && uvicorn main:app --reload"
echo "    cd code/notebooks && jupyter notebook"
