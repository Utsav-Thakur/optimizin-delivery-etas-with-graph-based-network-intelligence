"""
evaluation/evaluate_models.py
==============================
Model evaluation & benchmarking for DeliveryIQ.

Loads the saved model artefacts from output/models/ and the test predictions
from output/data/processed/predictions.csv, then produces:
  - Console report (MAE, RMSE, Within-15%, Graph Advantage)
  - output/graphs/mae_comparison.png
  - output/graphs/accuracy_comparison.png
  - output/graphs/feature_importance.png
  - output/graphs/residual_plot.png
  - code/frontend/public/data/model_benchmark.json  (refreshed)

Usage:
    python evaluate_models.py
    python evaluate_models.py --no-plots      # skip figure generation
"""

import argparse
import json
import pickle
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

# ── resolve repo root ────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent.parent.parent   # repo root
sys.path.insert(0, str(ROOT / "code" / "model"))

from features.graph_features import (          # noqa: E402
    BASE_FEATURES,
    GRAPH_FEATURES,
    load_and_clean,
    build_graph_from_df,
    compute_graph_features,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
MODELS_DIR  = ROOT / "output" / "models"
PROC_DIR    = ROOT / "output" / "data"   / "processed"
GRAPHS_DIR  = ROOT / "output" / "graphs"
FE_DATA_DIR = ROOT / "code"   / "frontend" / "public" / "data"
BE_DATA_DIR = ROOT / "code"   / "backend"  / "data"

# ─── Plot style ───────────────────────────────────────────────────────────────
plt.style.use(
    "seaborn-v0_8-whitegrid"
    if "seaborn-v0_8-whitegrid" in plt.style.available
    else "default"
)
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["figure.figsize"] = (10, 6)


# ─── Load artefacts ──────────────────────────────────────────────────────────

def load_model(name: str):
    path = MODELS_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}\nRun training/train_models.py first.")
    with open(path, "rb") as f:
        return pickle.load(f)


def load_predictions() -> pd.DataFrame:
    csv = PROC_DIR / "predictions.csv"
    if not csv.exists():
        raise FileNotFoundError(f"Predictions not found: {csv}\nRun training/train_models.py first.")
    df = pd.read_csv(csv)
    print(f"[eval] Loaded predictions: {len(df):,} rows")
    return df


# ─── Metric helpers ──────────────────────────────────────────────────────────

def metrics_from_preds(y_true, y_pred) -> dict:
    mae  = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    safe = np.where(y_true == 0, 1.0, y_true)
    pct15 = float((np.abs(y_true - y_pred) / safe <= 0.15).mean() * 100)
    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "Within 15%": round(pct15, 2)}


def print_benchmark_table(benchmark: dict) -> None:
    print("\n" + "─" * 70)
    print(f"  {'Model':<28} {'MAE':>8} {'RMSE':>8} {'Within 15%':>12} {'Graph Adv':>10}")
    print("─" * 70)
    for name, m in benchmark.items():
        adv = m.get("Graph Advantage", "—")
        print(f"  {name:<28} {m['MAE']:>8.2f} {m['RMSE']:>8.2f} {m['Within 15%']:>11.1f}%  {adv:>9}")
    print("─" * 70)


# ─── Plots ───────────────────────────────────────────────────────────────────

def plot_mae_comparison(benchmark: dict) -> None:
    labels = list(benchmark.keys())
    maes   = [v["MAE"] for v in benchmark.values()]
    colors = ["#cce6ff", "#99ccff", "#3399ff", "#ff4d4d"]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(labels, maes, color=colors, edgecolor="white", linewidth=0.8)
    for bar, val in zip(bars, maes):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                f"{val:.2f}", ha="center", va="bottom", fontsize=11, fontweight="bold")
    ax.set_title("Model MAE Comparison (Lower is Better)", fontsize=14, fontweight="bold")
    ax.set_ylabel("Mean Absolute Error (Minutes)")
    ax.set_ylim(0, max(maes) * 1.25)
    plt.tight_layout()
    out = GRAPHS_DIR / "mae_comparison.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  [plot] {out}")


def plot_accuracy_comparison(benchmark: dict) -> None:
    labels = list(benchmark.keys())
    pcts   = [v["Within 15%"] for v in benchmark.values()]
    colors = ["#cce6ff", "#99ccff", "#3399ff", "#ff4d4d"]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(labels, pcts, color=colors, edgecolor="white", linewidth=0.8)
    for bar, val in zip(bars, pcts):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                f"{val:.1f}%", ha="center", va="bottom", fontsize=11, fontweight="bold")
    ax.set_title("Prediction Accuracy — % Within 15% of Actual (Higher is Better)",
                 fontsize=14, fontweight="bold")
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(0, min(100, max(pcts) * 1.25))
    plt.tight_layout()
    out = GRAPHS_DIR / "accuracy_comparison.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  [plot] {out}")


def plot_feature_importance(eta_model) -> None:
    features     = BASE_FEATURES + GRAPH_FEATURES
    importances  = eta_model.feature_importances_

    feat_df = pd.DataFrame({"feature": features, "importance": importances})
    feat_df = feat_df.sort_values("importance", ascending=False).head(15)
    feat_df["color"] = feat_df["feature"].apply(
        lambda x: "#ffa64d" if x in GRAPH_FEATURES else "#4d94ff"
    )

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.barh(feat_df["feature"], feat_df["importance"],
            color=feat_df["color"], edgecolor="white", linewidth=0.6)
    ax.invert_yaxis()
    ax.set_xlabel("XGBoost Gini Importance Score")
    ax.set_title("Top 15 Feature Importances\n(Graph features in orange · Base features in blue)",
                 fontsize=14, fontweight="bold")

    from matplotlib.patches import Patch
    legend_handles = [
        Patch(facecolor="#4d94ff", label="Base features"),
        Patch(facecolor="#ffa64d", label="Graph features"),
    ]
    ax.legend(handles=legend_handles, loc="lower right")
    plt.tight_layout()
    out = GRAPHS_DIR / "feature_importance.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  [plot] {out}")


def plot_residuals(preds_df: pd.DataFrame) -> None:
    sample = preds_df.sample(min(2000, len(preds_df)), random_state=42)
    fig, ax = plt.subplots(figsize=(10, 6))

    for route, color in [("FTL", "#4d94ff"), ("Carting", "#ff4d4d")]:
        sub = sample[sample["route_type"] == route]
        ax.scatter(sub["actual_time"], sub["predicted_time_graph"],
                   alpha=0.4, s=10, color=color, label=route)

    max_val = preds_df["actual_time"].quantile(0.99)
    ax.plot([0, max_val], [0, max_val], "k--", lw=1.2, label="Perfect prediction")
    ax.set_xlim(0, max_val)
    ax.set_ylim(0, max_val)
    ax.set_xlabel("Actual Segment Time (Minutes)")
    ax.set_ylabel("Predicted Segment Time (Minutes)")
    ax.set_title("Actual vs Predicted — Graph-Enhanced XGBoost", fontsize=14, fontweight="bold")
    ax.legend()
    plt.tight_layout()
    out = GRAPHS_DIR / "residual_plot.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  [plot] {out}")


# ─── Benchmark from saved predictions ────────────────────────────────────────

def build_benchmark_from_preds(preds_df: pd.DataFrame) -> dict:
    """
    Reconstruct a benchmark dictionary from the saved predictions CSV.
    Only base and graph XGBoost predictions are stored, so the benchmark
    reflects those two.  The full 4-model benchmark is loaded from the
    existing model_benchmark.json if available.
    """
    bench_path = FE_DATA_DIR / "model_benchmark.json"
    if bench_path.exists():
        with open(bench_path, encoding="utf-8") as f:
            return json.load(f)

    # Fallback: compute from predictions only
    m_graph = metrics_from_preds(preds_df["actual_time"], preds_df["predicted_time_graph"])
    m_base  = metrics_from_preds(preds_df["actual_time"], preds_df["predicted_time_base"])
    adv = (m_base["MAE"] - m_graph["MAE"]) / m_base["MAE"] * 100
    return {
        "XGBoost baseline": {**m_base, "Graph Advantage": "N/A"},
        "XGBoost + Graph" : {**m_graph, "Graph Advantage": f"+{adv:.2f}%"},
    }


# ─── Error analysis ──────────────────────────────────────────────────────────

def error_analysis(preds_df: pd.DataFrame) -> None:
    """Print a breakdown of prediction error by route type."""
    print("\n[eval] Error Analysis by Route Type:")
    print(f"  {'Route Type':<12} {'Count':>8} {'MAE':>8} {'Within 15%':>12}")
    print("  " + "─" * 45)
    for rt in preds_df["route_type"].unique():
        sub = preds_df[preds_df["route_type"] == rt]
        m   = metrics_from_preds(sub["actual_time"], sub["predicted_time_graph"])
        print(f"  {rt:<12} {len(sub):>8,} {m['MAE']:>8.2f} {m['Within 15%']:>11.1f}%")

    # Large error buckets
    err_pct = (
        (preds_df["actual_time"] - preds_df["predicted_time_graph"]).abs()
        / preds_df["actual_time"].replace(0, 1)
        * 100
    )
    print("\n[eval] Error Distribution (graph model):")
    for threshold in [5, 10, 15, 20, 30, 50]:
        pct = (err_pct <= threshold).mean() * 100
        print(f"  Within {threshold:>2}%:  {pct:.1f}%")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(make_plots: bool = True) -> None:
    GRAPHS_DIR.mkdir(parents=True, exist_ok=True)
    FE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    BE_DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("  DeliveryIQ — Model Evaluation")
    print("=" * 60)

    # Load artefacts
    eta_model = load_model("eta_model.pkl")
    preds_df  = load_predictions()
    benchmark = build_benchmark_from_preds(preds_df)

    # Console report
    print_benchmark_table(benchmark)
    error_analysis(preds_df)

    # Refresh benchmark JSON (frontend + backend)
    payload = json.dumps(benchmark, indent=2, default=float)
    for p in [FE_DATA_DIR / "model_benchmark.json", BE_DATA_DIR / "model_benchmark.json"]:
        p.write_text(payload, encoding="utf-8")
        print(f"  [save] {p}")

    if make_plots:
        print("\n[eval] Generating plots …")
        plot_mae_comparison(benchmark)
        plot_accuracy_comparison(benchmark)
        plot_feature_importance(eta_model)
        plot_residuals(preds_df)

    print("\n[eval] Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate DeliveryIQ models")
    parser.add_argument("--no-plots", action="store_true", help="Skip plot generation")
    args = parser.parse_args()
    main(make_plots=not args.no_plots)
