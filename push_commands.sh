#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║       ⬡  DeliveryIQ — GitHub Push Commands                  ║
# ║  Usage: chmod +x push_commands.sh && ./push_commands.sh      ║
# ║  Run from the root of your DeliveryIQ project folder.        ║
# ╚══════════════════════════════════════════════════════════════╝
#
# This script will:
#   1. Organise the project (python organize_project.py)
#   2. Initialise a Git repository
#   3. Create the first commit
#   4. Push to GitHub at https://github.com/Utsav-Thakur/optimizin-delivery-etas-with-graph-based-network-intelligence
#
# PRE-REQUISITES:
#   - Git installed  (git --version)
#   - GitHub account with empty repo created at the URL above
#   - SSH key OR Personal Access Token configured for GitHub
#     (https://docs.github.com/en/authentication)

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║       ⬡  DeliveryIQ GitHub Push Script                     ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 0 · Organise the project first
# ──────────────────────────────────────────────────────────────
echo -e "${CYAN}[0/6] Running project organizer…${NC}"
if command -v python3 &>/dev/null; then
    python3 organize_project.py
elif command -v python &>/dev/null; then
    python organize_project.py
else
    echo -e "${YELLOW}  ⚠  Python not found. Skipping auto-organise. Run manually.${NC}"
fi

# ──────────────────────────────────────────────────────────────
# Step 1 · Initialise Git repo (safe — skip if already inited)
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[1/6] Initialising Git repository…${NC}"
git init
echo -e "${GREEN}  ✓ Git repository ready.${NC}"

# ──────────────────────────────────────────────────────────────
# Step 2 · Set default branch to main
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[2/6] Setting default branch to main…${NC}"
git checkout -b main 2>/dev/null || git checkout main
echo -e "${GREEN}  ✓ Branch: main${NC}"

# ──────────────────────────────────────────────────────────────
# Step 3 · Stage all files
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[3/6] Staging all files…${NC}"
git add .
echo -e "${GREEN}  ✓ All files staged.${NC}"

# Show what's being committed
echo ""
echo "  Files to be committed:"
git diff --cached --name-status | head -50
TOTAL=$(git diff --cached --name-only | wc -l)
echo ""
echo -e "  Total files: ${GREEN}${TOTAL}${NC}"

# ──────────────────────────────────────────────────────────────
# Step 4 · First commit
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[4/6] Creating initial commit…${NC}"
git commit -m "feat: DeliveryIQ — Graph-Based Logistics Network Intelligence

📦 Project structure:
  code/notebooks  — Jupyter analysis notebook (7 parts) + pipeline scripts
  code/frontend   — React 18 + Vite + TailwindCSS interactive dashboard
  code/backend    — FastAPI REST API server with Pydantic schemas

📊 Outputs:
  output/data/raw        — Original 144,867-row Delhivery dataset
  output/data/processed  — Bottleneck hubs, corridor audit, predictions, FTL table
  output/models          — Trained XGBoost (ETA + FTL) + serialised NetworkX graph
  output/graphs          — 10 analytical PNG visualisations
  output/maps            — 3 interactive Leaflet HTML maps

🔑 Key results:
  • 1,508 facility nodes · 144,867 trip segments · 83% corridors delayed
  • XGBoost + graph features → MAE 6.3 hrs · 71% within-15% accuracy
  • 2.22× average delay multiplier across the network
  • Zero-API AI recommendations (no external LLM keys required)

🛠 Stack: Python · NetworkX · XGBoost · Folium · React · Recharts · FastAPI"

echo -e "${GREEN}  ✓ Initial commit created.${NC}"

# ──────────────────────────────────────────────────────────────
# Step 5 · Add remote origin
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[5/6] Adding GitHub remote…${NC}"

REMOTE_URL="https://github.com/Utsav-Thakur/optimizin-delivery-etas-with-graph-based-network-intelligence"

# Remove existing remote if any (idempotent)
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
echo -e "${GREEN}  ✓ Remote set to: ${REMOTE_URL}${NC}"

# ──────────────────────────────────────────────────────────────
# Step 6 · Push to GitHub
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[6/6] Pushing to GitHub…${NC}"
echo -e "${YELLOW}  ℹ  If prompted, enter your GitHub Personal Access Token as the password.${NC}"
echo -e "${YELLOW}     (GitHub no longer accepts plain passwords — use a PAT or SSH key)${NC}"
echo ""

git push -u origin main

echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║                    🚀 Push Complete!                        ║"
echo "╠═════════════════════════════════════════════════════════════╣"
echo "║  Repository: https://github.com/Utsav-Thakur/optimizin-delivery-etas-with-graph-based-network-intelligence ║"
echo "║                                                             ║"
echo "║  Next steps:                                                ║"
echo "║   • Add a repository description on GitHub                  ║"
echo "║   • Add topics: logistics, graph-ml, xgboost, networkx      ║"
echo "║   • Enable GitHub Pages if you want to host the dashboard   ║"
echo "║   • Set up GitHub Actions for CI (optional)                 ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""
