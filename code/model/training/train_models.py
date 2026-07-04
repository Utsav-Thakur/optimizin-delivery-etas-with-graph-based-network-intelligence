"""
training/train_models.py
=========================
Model training for DeliveryIQ — ETA regression + FTL/Carting classifier.

Trains four ETA models and one routing classifier, saves:
  output/models/eta_model.pkl       ← XGBoost graph-enhanced ETA regressor
  output/models/eta_scaler.pkl      ← StandardScaler for ETA features
  output/models/ftl_model.pkl       ← XGBoost FTL vs Carting classifier
  output/models/ftl_scaler.pkl      ← StandardScaler for FTL features
  output/models/graph.graphml       ← Serialised NetworkX graph
  output/data/processed/predictions.csv
  code/frontend/public/data/model_benchmark.json
  code/frontend/public/data/feature_importance.json

Usage:
    python train_models.py [--data <path_to_delivery_data.csv>]
"""

import argparse
import json
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import networkx as nx
from sklearn.linear_model    import LinearRegression
from sklearn.ensemble        import RandomForestRegressor
from sklearn.metrics         import (
    mean_absolute_error, mean_squared_error,
    accuracy_score, roc_auc_score, classification_report,
)
from sklearn.preprocessing   import StandardScaler
from xgboost                 import XGBRegressor, XGBClassifier

# ── resolve project root regardless of where the script is run from ──────────
ROOT = Path(__file__).parent.parent.parent.parent   # repo root

sys.path.insert(0, str(ROOT / "code" / "model"))
from features.graph_features import (          # noqa: E402
    build_feature_matrix,
    BASE_FEATURES,
    GRAPH_FEATURES,
    CLASSIFIER_FEATURES,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
MODELS_DIR   = ROOT / "output" / "models"
PROC_DIR     = ROOT / "output" / "data" / "processed"
FE_DATA_DIR  = ROOT / "code"   / "frontend" / "public" / "data"
BE_DATA_DIR  = ROOT / "code"   / "backend"  / "data"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def ensure_dirs() -> None:
    for d in [MODELS_DIR, PROC_DIR, FE_DATA_DIR, BE_DATA_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def save_json(obj: dict | list, *paths: Path) -> None:
    """Write JSON to one or more destinations (e.g. frontend + backend)."""
    payload = json.dumps(obj, indent=2, default=float)
    for p in paths:
        p.write_text(payload, encoding="utf-8")
        print(f"  [save] {p}")


def save_pickle(obj, path: Path) -> None:
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print(f"  [save] {path}")


# ─── ETA Regression ───────────────────────────────────────────────────────────

def train_eta_models(df: pd.DataFrame) -> dict:
    """
    Train four ETA regressors and return a benchmark dictionary.

    Models:
      1. Linear Regression (baseline, no graph features)
      2. Random Forest     (baseline, no graph features)
      3. XGBoost Baseline  (no graph features)
      4. XGBoost + Graph   ← the production model
    """
    train_mask = df["data"] == "training"
    test_mask  = df["data"] == "test"

    X_tr_base = df.loc[train_mask, BASE_FEATURES]
    X_te_base = df.loc[test_mask,  BASE_FEATURES]
    X_tr_graph= df.loc[train_mask, BASE_FEATURES + GRAPH_FEATURES]
    X_te_graph= df.loc[test_mask,  BASE_FEATURES + GRAPH_FEATURES]
    y_train   = df.loc[train_mask, "segment_actual_time"]
    y_test    = df.loc[test_mask,  "segment_actual_time"]

    # Fit & save ETA scaler
    eta_scaler = StandardScaler().fit(X_tr_base)
    save_pickle(eta_scaler, MODELS_DIR / "eta_scaler.pkl")

    def eval_model(model, X_tr, X_te, label: str):
        print(f"\n  Training {label} …")
        model.fit(X_tr, y_train)
        preds  = model.predict(X_te)
        mae    = mean_absolute_error(y_test, preds)
        rmse   = float(np.sqrt(mean_squared_error(y_test, preds)))
        safe_y = np.where(y_test == 0, 1.0, y_test)
        pct15  = float((np.abs(y_test - preds) / safe_y <= 0.15).mean() * 100)
        print(f"    MAE={mae:.2f}  RMSE={rmse:.2f}  Within-15%={pct15:.1f}%")
        return mae, rmse, pct15, preds

    lr_mae,   lr_rmse,   lr_pct,   _          = eval_model(LinearRegression(),                                     X_tr_base,  X_te_base,  "Linear Regression")
    rf_mae,   rf_rmse,   rf_pct,   _          = eval_model(RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1), X_tr_base,  X_te_base,  "Random Forest")
    xgb_mae,  xgb_rmse,  xgb_pct,  xgb_preds = eval_model(XGBRegressor(n_estimators=100, max_depth=6,  random_state=42, n_jobs=-1), X_tr_base,  X_te_base,  "XGBoost Baseline")

    # ── Production model: XGBoost + Graph Features ────────────────────────────
    xgb_graph = XGBRegressor(n_estimators=100, max_depth=6, random_state=42, n_jobs=-1)
    xgbg_mae, xgbg_rmse, xgbg_pct, xgbg_preds = eval_model(xgb_graph, X_tr_graph, X_te_graph, "XGBoost + Graph")
    save_pickle(xgb_graph, MODELS_DIR / "eta_model.pkl")

    advantage_mae = (xgb_mae - xgbg_mae) / xgb_mae * 100
    print(f"\n  [train] Graph advantage in MAE: +{advantage_mae:.2f}%")

    # ── Predictions CSV ───────────────────────────────────────────────────────
    preds_df = pd.DataFrame({
        "actual_time"          : y_test.values,
        "predicted_time_base"  : xgb_preds,
        "predicted_time_graph" : xgbg_preds,
        "route_type"           : df.loc[test_mask, "route_type"].values,
        "source_center"        : df.loc[test_mask, "source_center"].values,
        "destination_center"   : df.loc[test_mask, "destination_center"].values,
    })
    preds_csv = PROC_DIR / "predictions.csv"
    preds_df.to_csv(preds_csv, index=False)
    print(f"  [save] {preds_csv}  ({len(preds_df):,} rows)")

    # ── Feature importance ────────────────────────────────────────────────────
    feat_imp = dict(zip(
        BASE_FEATURES + GRAPH_FEATURES,
        xgb_graph.feature_importances_.tolist(),
    ))
    feat_imp = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True))
    save_json(feat_imp, FE_DATA_DIR / "feature_importance.json", BE_DATA_DIR / "feature_importance.json")

    # ── Benchmark JSON ────────────────────────────────────────────────────────
    benchmark = {
        "Linear Regression": {"MAE": round(lr_mae, 2),   "RMSE": round(lr_rmse, 2),   "Within 15%": round(lr_pct, 2),   "Graph Advantage": "N/A"},
        "Random Forest"    : {"MAE": round(rf_mae, 2),   "RMSE": round(rf_rmse, 2),   "Within 15%": round(rf_pct, 2),   "Graph Advantage": "N/A"},
        "XGBoost baseline" : {"MAE": round(xgb_mae, 2),  "RMSE": round(xgb_rmse, 2),  "Within 15%": round(xgb_pct, 2),  "Graph Advantage": "N/A"},
        "XGBoost + Graph"  : {"MAE": round(xgbg_mae, 2), "RMSE": round(xgbg_rmse, 2), "Within 15%": round(xgbg_pct, 2), "Graph Advantage": f"+{advantage_mae:.2f}%"},
    }
    save_json(benchmark, FE_DATA_DIR / "model_benchmark.json", BE_DATA_DIR / "model_benchmark.json")
    return benchmark


# ─── FTL vs Carting Classifier ───────────────────────────────────────────────

def train_ftl_classifier(df: pd.DataFrame) -> XGBClassifier:
    """
    Train the XGBoost FTL vs Carting binary classifier.
    Saves ftl_model.pkl and ftl_scaler.pkl.
    """
    print("\n[train] Training FTL vs Carting Classifier …")

    y = (df["route_type"] == "FTL").astype(int)

    # Rename to match classifier feature names
    clf_df = df[CLASSIFIER_FEATURES + ["data"]].copy()
    clf_df = clf_df.rename(columns={"is_cutoff_encoded": "is_cutoff"})

    train_mask = df["data"] == "training"
    test_mask  = df["data"] == "test"

    X_tr, y_tr = clf_df.loc[train_mask, CLASSIFIER_FEATURES], y[train_mask]
    X_te, y_te = clf_df.loc[test_mask,  CLASSIFIER_FEATURES], y[test_mask]

    # Scaler
    clf_scaler = StandardScaler().fit(X_tr)
    save_pickle(clf_scaler, MODELS_DIR / "ftl_scaler.pkl")

    clf = XGBClassifier(n_estimators=100, max_depth=6, random_state=42, n_jobs=-1, eval_metric="logloss")
    clf.fit(X_tr, y_tr)
    save_pickle(clf, MODELS_DIR / "ftl_model.pkl")

    preds = clf.predict(X_te)
    probs = clf.predict_proba(X_te)[:, 1]

    acc = accuracy_score(y_te, preds)
    auc = roc_auc_score(y_te, probs)
    print(f"  Accuracy : {acc:.4f}")
    print(f"  ROC-AUC  : {auc:.4f}")
    print("\n  Classification Report:")
    print(classification_report(y_te, preds, target_names=["Carting", "FTL"]))

    return clf


# ─── Graph save ──────────────────────────────────────────────────────────────

def save_graph(G: nx.DiGraph) -> None:
    out = MODELS_DIR / "graph.graphml"
    nx.write_graphml(G, str(out))
    print(f"  [save] {out}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(data_path: Path) -> None:
    ensure_dirs()

    print("=" * 60)
    print("  DeliveryIQ — Model Training Pipeline")
    print("=" * 60)

    # 1. Build feature matrix
    df, G, *_ = build_feature_matrix(data_path)

    # 2. Save graph
    print("\n[train] Saving NetworkX graph …")
    save_graph(G)

    # 3. ETA regression
    print("\n[train] ETA Regression Models")
    print("-" * 40)
    benchmark = train_eta_models(df)

    # 4. FTL classifier
    train_ftl_classifier(df)

    # 5. Summary
    print("\n" + "=" * 60)
    print("  Training Complete — Summary")
    print("=" * 60)
    for name, metrics in benchmark.items():
        adv = metrics.get("Graph Advantage", "N/A")
        print(f"  {name:<25} MAE={metrics['MAE']:<8.2f} Within-15%={metrics['Within 15%']:.1f}%  Graph Adv={adv}")
    print("\n  Saved artefacts:")
    for f in MODELS_DIR.iterdir():
        print(f"    output/models/{f.name}  ({f.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train DeliveryIQ models")
    parser.add_argument(
        "--data",
        type=Path,
        default=ROOT / "output" / "data" / "raw" / "delivery_data.csv",
        help="Path to delivery_data.csv",
    )
    args = parser.parse_args()
    main(args.data)
