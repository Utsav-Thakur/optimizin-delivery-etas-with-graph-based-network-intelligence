# ⬡ DeliveryIQ — `code/model/`

This package contains all ML model code for the DeliveryIQ project,
split into three focused sub-packages.

## Structure

```
code/model/
│
├── features/
│   └── graph_features.py      ← Feature engineering (graph + base features)
│
├── training/
│   └── train_models.py        ← Train ETA regressor + FTL classifier
│
└── evaluation/
    └── evaluate_models.py     ← Benchmark, error analysis, plot generation
```

## Quick Run (order matters)

```bash
# 1. Feature engineering (optional — training script calls this automatically)
python code/model/features/graph_features.py

# 2. Train all models (saves .pkl files to output/models/)
python code/model/training/train_models.py

# 3. Evaluate & regenerate plots
python code/model/evaluation/evaluate_models.py
```

## Output Artefacts

| File | Description |
|------|-------------|
| `output/models/eta_model.pkl` | XGBoost graph-enhanced ETA regressor |
| `output/models/eta_scaler.pkl` | StandardScaler fitted on ETA training set |
| `output/models/ftl_model.pkl` | XGBoost FTL vs Carting binary classifier |
| `output/models/ftl_scaler.pkl` | StandardScaler fitted on FTL training set |
| `output/models/graph.graphml` | Serialised NetworkX DiGraph |
| `output/data/processed/predictions.csv` | Test-set predictions (base + graph) |
| `output/graphs/mae_comparison.png` | MAE bar chart (4 models) |
| `output/graphs/accuracy_comparison.png` | Within-15% accuracy bar chart |
| `output/graphs/feature_importance.png` | Top 15 XGBoost feature importances |
| `output/graphs/residual_plot.png` | Actual vs predicted scatter |

## Key Feature Groups

### Base Features (8)
Standard trip-level features available without graph:  
`segment_osrm_time`, `segment_osrm_distance`, `route_type_encoded`,  
`is_cutoff_encoded`, `cutoff_factor`, `hour_of_day`,  
`time_of_day_encoded`, `actual_distance_to_destination`

### Graph Features (10)  — the DeliveryIQ advantage
Derived from NetworkX graph centrality & corridor aggregations:  
`betweenness_centrality_{source,dest}`, `in_degree_source`, `out_degree_dest`,  
`avg_delay_ratio_{source,dest}`, `pct_sla_breach_{source,dest}`,  
`corridor_median_delay_ratio`, `corridor_trip_count`

> **Graph Advantage**: Adding graph features reduces ETA MAE by ~35% compared
> to XGBoost trained on base features only.
