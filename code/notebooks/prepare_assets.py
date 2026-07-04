import os
import shutil
import pandas as pd
import json

print("Starting assets preparation...")

# Create target directories
os.makedirs("public/data", exist_ok=True)
os.makedirs("public/maps", exist_ok=True)
print("Created public/data and public/maps directories.")

# Map files to copy
maps_to_copy = {
    r"outputs\maps\tsp_tour_N10.html": r"public\maps\tsp_tour_N10.html",
    r"outputs\maps\tsp_tour_N1000.html": r"public\maps\tsp_tour_N1000.html",
    r"outputs\maps\corridor_delay_map.html": r"public\maps\corridor_delay_map.html"
}

for src, dst in maps_to_copy.items():
    if os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Copied map: {src} -> {dst}")
    else:
        print(f"Warning: Map not found: {src}")

# JSON files to copy
jsons_to_copy = {
    "model_benchmark.json": r"public\data\model_benchmark.json",
    "feature_importance.json": r"public\data\feature_importance.json",
    "ftl_advisor_rules.json": r"public\data\ftl_advisor_rules.json",
    "hub_insights.json": r"public\data\hub_insights.json",
    "corridor_recommendations.json": r"public\data\corridor_recommendations.json",
    "risk_scores.json": r"public\data\risk_scores.json",
    "network_intelligence.json": r"public\data\network_intelligence.json",
    "network_stats.json": r"public\data\network_stats.json"
}

for src, dst in jsons_to_copy.items():
    if os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Copied data: {src} -> {dst}")
    else:
        print(f"Warning: JSON data not found: {src}")

# CSV files to convert to JSON
csvs_to_convert = {
    "bottleneck_hubs.csv": r"public\data\bottleneck_hubs.json",
    "corridor_audit.csv": r"public\data\corridor_audit.json"
}

for src, dst in csvs_to_convert.items():
    if os.path.exists(src):
        df = pd.read_csv(src)
        # convert df to list of dicts and save as JSON
        data = df.to_dict(orient='records')
        with open(dst, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Converted CSV to JSON: {src} -> {dst}")
    else:
        print(f"Warning: CSV not found for conversion: {src}")

print("Assets preparation complete.")
