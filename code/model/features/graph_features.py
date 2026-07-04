"""
features/graph_features.py
===========================
Graph-based feature engineering for DeliveryIQ.

Reads the raw delivery CSV and the saved NetworkX graph, then computes
per-trip graph features (betweenness centrality, degree, delay ratios,
SLA breach rates, corridor statistics) and merges them back onto the
dataframe — ready for model training.

Usage (standalone):
    python graph_features.py

Or import in training scripts:
    from features.graph_features import build_feature_matrix
"""

import pickle
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
import networkx as nx

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT        = Path(__file__).parent.parent.parent   # repo root
DATA_RAW    = ROOT / "output" / "data" / "raw"      / "delivery_data.csv"
GRAPH_PATH  = ROOT / "output" / "models"            / "graph.graphml"
OUT_PATH    = ROOT / "output" / "data" / "processed"/ "featured_dataset.pkl"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_time_of_day(hour: int) -> str:
    if 6 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 18:
        return "Afternoon"
    elif 18 <= hour < 24:
        return "Evening"
    return "Night"


def load_and_clean(csv_path: Path) -> pd.DataFrame:
    """Load the raw delivery CSV and apply standard cleaning steps."""
    print(f"[features] Loading raw data from {csv_path} …")
    df = pd.read_csv(csv_path)
    print(f"[features]   {df.shape[0]:,} rows × {df.shape[1]} columns")

    # Parse cutoff timestamp and propagate within trip groups
    df["parsed_cutoff"] = pd.to_datetime(
        df["cutoff_timestamp"], errors="coerce", dayfirst=True
    )
    df["parsed_cutoff"] = (
        df.groupby("trip_uuid")["parsed_cutoff"].ffill().bfill()
    )
    df["hour_of_day"] = df["parsed_cutoff"].dt.hour

    # Impute hub names by mode per center code
    for prefix in ["source", "destination"]:
        c_col, n_col = f"{prefix}_center", f"{prefix}_name"
        modes = df.groupby(c_col)[n_col].apply(
            lambda x: x.mode().iloc[0] if not x.mode().empty else "Unknown"
        )
        df[n_col] = df[n_col].fillna(df[c_col].map(modes))

    # Segment factor clipping & delay ratio
    df["segment_factor_clipped"] = df["segment_factor"].clip(-5, 20)
    df["delay_ratio"] = df["segment_actual_time"] / np.where(
        df["segment_osrm_time"] == 0, 1.0, df["segment_osrm_time"]
    )
    df["is_delayed"]   = (df["segment_factor_clipped"] > 1.2).astype(int)
    df["time_of_day"]  = df["hour_of_day"].apply(get_time_of_day)

    # Encoding helpers needed downstream
    df["route_type_encoded"]  = (df["route_type"] == "FTL").astype(int)
    df["is_cutoff_encoded"]   = df["is_cutoff"].astype(int)
    tod_map = {"Morning": 0, "Afternoon": 1, "Evening": 2, "Night": 3}
    df["time_of_day_encoded"] = df["time_of_day"].map(tod_map)

    print("[features] Cleaning complete.")
    return df


def build_graph_from_df(df: pd.DataFrame) -> tuple[nx.DiGraph, dict, dict]:
    """
    Aggregate corridors from df and build a weighted directed graph.

    Returns
    -------
    G         : NetworkX DiGraph
    name_map  : {center_id -> facility_name}
    state_map : {center_id -> state_name}
    """
    print("[features] Aggregating corridors …")
    corridors = (
        df.groupby(["source_center", "destination_center"])
        .agg(
            median_delay_ratio=("delay_ratio",              "median"),
            trip_count        =("trip_uuid",               "count"),
            pct_delayed       =("is_delayed",              "mean"),
            avg_distance      =("segment_osrm_distance",   "mean"),
        )
        .reset_index()
    )

    dominant_route = (
        df.groupby(["source_center", "destination_center"])["route_type"]
        .agg(lambda x: x.mode().iloc[0] if not x.mode().empty else "Unknown")
        .reset_index()
        .rename(columns={"route_type": "route_type_dominant"})
    )

    def peak_delay(grp):
        sub = grp.groupby("time_of_day")["delay_ratio"].median()
        return sub.idxmax() if not sub.empty else "Unknown"

    corridor_peak = (
        df.groupby(["source_center", "destination_center"])
        .apply(peak_delay, include_groups=False)
        .reset_index()
        .rename(columns={0: "peak_delay_time"})
    )

    corridors = corridors.merge(dominant_route, on=["source_center", "destination_center"])
    corridors = corridors.merge(corridor_peak,  on=["source_center", "destination_center"])

    print("[features] Building NetworkX DiGraph …")
    G = nx.DiGraph()
    for _, row in corridors.iterrows():
        G.add_edge(
            row["source_center"], row["destination_center"],
            weight             = row["median_delay_ratio"],
            median_delay_ratio = row["median_delay_ratio"],
            trip_count         = row["trip_count"],
            pct_delayed        = row["pct_delayed"],
            route_type_dominant= row["route_type_dominant"],
            peak_delay_time    = row["peak_delay_time"],
            avg_distance       = row["avg_distance"],
        )

    # Build name / state lookup
    name_map: dict[str, str] = {}
    state_map: dict[str, str] = {}
    for prefix in ["source", "destination"]:
        for cid, name in (
            df[[f"{prefix}_center", f"{prefix}_name"]].drop_duplicates().values
        ):
            name_map[cid] = name
            match = re.search(r"\(([^)]+)\)", str(name))
            state_map[cid] = match.group(1) if match else "Unknown"

    return G, name_map, state_map, corridors


def compute_graph_features(
    df: pd.DataFrame,
    G: nx.DiGraph,
    corridors: pd.DataFrame,
) -> pd.DataFrame:
    """
    Compute per-node and per-edge graph features and merge them onto df.

    Features added
    --------------
    Node-level (source / destination):
      betweenness_centrality_{source,dest}
      in_degree_source, out_degree_dest
      avg_delay_ratio_{source,dest}
      pct_sla_breach_{source,dest}

    Edge-level (corridor):
      corridor_median_delay_ratio
      corridor_trip_count

    Aliases for classifier:
      betweenness_source
      avg_delay_ratio_corridor
    """
    print("[features] Computing betweenness centrality (may take a moment) …")
    betweenness   = nx.betweenness_centrality(G, weight="weight", normalized=True)
    in_degree_map = dict(G.in_degree())
    out_degree_map= dict(G.out_degree())

    node_trips = df.groupby("source_center").agg(
        avg_delay_ratio=("delay_ratio", "mean"),
        pct_ftl        =("route_type",  lambda x: (x == "FTL").mean()),
    )

    outbound_corridors = corridors.groupby("source_center").agg(
        pct_sla_breach    =("median_delay_ratio", lambda x: (x > 1.2).mean()),
        outbound_trip_count=("trip_count",          "sum"),
    )

    edge_median_delay = (
        corridors.set_index(["source_center", "destination_center"])
        ["median_delay_ratio"].to_dict()
    )
    edge_trip_count = (
        corridors.set_index(["source_center", "destination_center"])
        ["trip_count"].to_dict()
    )

    print("[features] Merging graph features onto trip rows …")
    df["betweenness_centrality_source"] = df["source_center"].map(betweenness).fillna(0.0)
    df["betweenness_centrality_dest"]   = df["destination_center"].map(betweenness).fillna(0.0)
    df["in_degree_source"]              = df["source_center"].map(in_degree_map).fillna(0)
    df["out_degree_dest"]               = df["destination_center"].map(out_degree_map).fillna(0)
    df["avg_delay_ratio_source"]        = df["source_center"].map(node_trips["avg_delay_ratio"]).fillna(1.0)
    df["avg_delay_ratio_dest"]          = df["destination_center"].map(node_trips["avg_delay_ratio"]).fillna(1.0)
    df["pct_sla_breach_source"]         = df["source_center"].map(outbound_corridors["pct_sla_breach"]).fillna(0.0)
    df["pct_sla_breach_dest"]           = df["destination_center"].map(outbound_corridors["pct_sla_breach"]).fillna(0.0)

    keys = list(zip(df["source_center"], df["destination_center"]))
    df["corridor_median_delay_ratio"] = [edge_median_delay.get(k, 1.0) for k in keys]
    df["corridor_trip_count"]         = [edge_trip_count.get(k, 0) for k in keys]

    # Aliases used by the FTL classifier
    df["betweenness_source"]       = df["betweenness_centrality_source"]
    df["avg_delay_ratio_corridor"] = df["corridor_median_delay_ratio"]

    print("[features] Feature engineering complete.")
    return df, betweenness, outbound_corridors


# ─── Feature column lists (imported by training scripts) ─────────────────────

BASE_FEATURES = [
    "segment_osrm_time",
    "segment_osrm_distance",
    "route_type_encoded",
    "is_cutoff_encoded",
    "cutoff_factor",
    "hour_of_day",
    "time_of_day_encoded",
    "actual_distance_to_destination",
]

GRAPH_FEATURES = [
    "betweenness_centrality_source",
    "betweenness_centrality_dest",
    "in_degree_source",
    "out_degree_dest",
    "avg_delay_ratio_source",
    "avg_delay_ratio_dest",
    "pct_sla_breach_source",
    "pct_sla_breach_dest",
    "corridor_median_delay_ratio",
    "corridor_trip_count",
]

CLASSIFIER_FEATURES = [
    "segment_osrm_distance",
    "segment_osrm_time",
    "hour_of_day",
    "betweenness_source",
    "avg_delay_ratio_corridor",
    "is_cutoff_encoded",
    "cutoff_factor",
    "pct_sla_breach_source",
]


def build_feature_matrix(csv_path: Path = DATA_RAW):
    """
    End-to-end feature pipeline.  Returns a feature-enriched DataFrame
    together with graph artefacts needed by the training scripts.
    """
    df                               = load_and_clean(csv_path)
    G, name_map, state_map, corr_df  = build_graph_from_df(df)
    df, betweenness, outbound_corr   = compute_graph_features(df, G, corr_df)
    return df, G, name_map, state_map, corr_df, betweenness, outbound_corr


# ─── CLI entry point ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    df, G, *_ = build_feature_matrix()

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_pickle(str(OUT_PATH))
    print(f"[features] Saved feature-enriched dataset → {OUT_PATH}")

    print("\n[features] Graph summary:")
    print(f"  Nodes : {G.number_of_nodes():,}")
    print(f"  Edges : {G.number_of_edges():,}")
    print(f"  Density: {nx.density(G):.6f}")

    print("\n[features] Feature columns added:")
    for col in GRAPH_FEATURES:
        print(f"  {col}")
