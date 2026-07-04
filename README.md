<div align="center">

# ⬡ DeliveryIQ
### Graph-Based Logistics Network Intelligence

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.x-orange?style=for-the-badge)](https://networkx.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.x-189AB4?style=for-the-badge)](https://xgboost.readthedocs.io)
[![Folium](https://img.shields.io/badge/Folium-Leaflet-77B829?style=for-the-badge)](https://python-visualization.github.io/folium)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-FF6384?style=for-the-badge)](https://recharts.org)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)]()

**An end-to-end graph intelligence system for Delhivery's logistics network —  
predicting ETAs, surfacing bottleneck hubs, and generating zero-API AI recommendations  
across 144,867 trip segments.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Key Results](#-key-results)
- [Output Files](#-output-files)
- [Technology Stack](#-technology-stack)
- [Built By](#-built-by)

---

## 🔭 Overview

DeliveryIQ transforms raw Delhivery trip data into actionable logistics intelligence using a **graph-theoretic framework** built on NetworkX. The system:

- **Models the delivery network** as a weighted directed graph of 1,508 facilities connected by 144,867 trip segments
- **Predicts ETAs** using an XGBoost model trained on engineered graph features (betweenness centrality, segment load factor, hub delay probability)
- **Identifies bottleneck hubs** using betweenness centrality + custom congestion scoring
- **Audits high-delay corridors** with statistical significance testing
- **Recommends FTL vs. Carting** routing decisions via a graph-trained classifier
- **Generates zero-API AI insights** — all recommendations are rule-based, requiring no external LLM API keys
- **Visualises everything** in an interactive React dashboard with Leaflet maps

---

## 📁 Project Structure

```
DeliveryIQ/
│
├── code/
│   ├── notebooks/
│   │   ├── DeliveryIQ_Analysis.ipynb        ← Main Jupyter notebook (all 7 parts)
│   │   ├── run_pipeline.py                  ← End-to-end pipeline runner
│   │   └── prepare_assets.py               ← Asset preparation utilities
│   │
│   ├── model/                               ← ML model code (training & evaluation)
│   │   ├── training/                        ← XGBoost ETA & FTL training scripts
│   │   ├── evaluation/                      ← MAE comparison, residual plots, benchmarks
│   │   └── features/                        ← Graph feature engineering (centrality, load factor)
│   │
│   ├── frontend/                            ← React + Vite + TailwindCSS dashboard
│   │   ├── public/
│   │   │   ├── data/                        ← JSON data files for dashboard
│   │   │   │   ├── network_stats.json
│   │   │   │   ├── bottleneck_hubs.json
│   │   │   │   ├── corridor_audit.json
│   │   │   │   ├── model_benchmark.json
│   │   │   │   ├── feature_importance.json
│   │   │   │   ├── ftl_advisor_rules.json
│   │   │   │   ├── hub_insights.json
│   │   │   │   ├── corridor_recommendations.json
│   │   │   │   ├── risk_scores.json
│   │   │   │   └── network_intelligence.json
│   │   │   └── maps/                        ← Interactive Leaflet HTML maps
│   │   │       ├── tsp_tour_N10.html
│   │   │       ├── tsp_tour_N1000.html
│   │   │       └── corridor_delay_map.html
│   │   ├── src/
│   │   │   ├── components/                  ← Reusable UI components
│   │   │   ├── pages/                       ← Dashboard pages
│   │   │   ├── hooks/                       ← Custom React hooks
│   │   │   └── utils/                       ← Helper utilities
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── backend/                             ← FastAPI REST backend
│       ├── main.py                          ← FastAPI application entry point
│       ├── routers/                         ← Route handlers
│       ├── models/schemas.py               ← Pydantic schemas
│       ├── data/                            ← Backend copy of JSON data
│       └── requirements.txt
│
└── output/
    ├── data/
    │   ├── raw/
    │   │   └── delivery_data.csv            ← Original 144,867-row dataset (42 MB)
    │   └── processed/
    │       ├── bottleneck_hubs.csv          ← Top 20 hubs with all metrics
    │       ├── corridor_audit.csv           ← Top 50 delayed corridors
    │       ├── predictions.csv              ← Model predictions on test set
    │       └── ftl_framework.csv            ← FTL vs Carting decision table
    │
    ├── models/
    │   ├── eta_model.pkl                    ← Trained XGBoost ETA model
    │   ├── eta_scaler.pkl                   ← StandardScaler for ETA model
    │   ├── ftl_model.pkl                    ← Trained FTL classifier
    │   ├── ftl_scaler.pkl                   ← StandardScaler for FTL model
    │   └── graph.graphml                    ← Serialised NetworkX graph
    │
    ├── graphs/
    │   ├── network_graph.png                ← Full network visualisation
    │   ├── betweenness_bar.png              ← Top 20 hubs bar chart
    │   ├── delay_heatmap.png                ← Delay by route_type × time_of_day
    │   ├── segment_factor_distribution.png  ← Before/after clipping histogram
    │   ├── mae_comparison.png               ← Model MAE comparison bar chart
    │   ├── feature_importance.png           ← Top 15 features horizontal bar
    │   ├── residual_plot.png                ← Actual vs predicted scatter
    │   └── top_hubs_centrality.png          ← Betweenness centrality chart
    │
    └── maps/
        ├── tsp_tour_N10.html                ← Top 10 hubs Leaflet map
        ├── tsp_tour_N1000.html              ← Full network Leaflet map
        └── corridor_delay_map.html          ← Delay heatmap Leaflet map
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

### 1 · Auto-organise the project

```bash
# Run once to move all files into the correct structure
python organize_project.py
```

### 2 · Run the Analysis Notebook

```bash
cd code/notebooks
jupyter notebook DeliveryIQ_Analysis.ipynb
```

The notebook is divided into **7 self-contained parts**:

| Part | Topic |
|------|-------|
| 1 | Data Ingestion & Graph Construction |
| 2 | Exploratory Analysis & Centrality |
| 3 | Bottleneck Hub Identification |
| 4 | Corridor Delay Audit |
| 5 | ETA Prediction (XGBoost) |
| 6 | FTL vs. Carting Classifier |
| 7 | Interactive Leaflet Maps & Dashboard Export |

### 3 · Run the React Dashboard

```bash
cd code/frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4 · Run the FastAPI Backend

```bash
cd code/backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → API docs: http://localhost:8000/docs
```

---

## 📊 Key Results

### ETA Model Performance

| Model | MAE (hours) | Within 15% Accuracy | Notes |
|-------|------------|---------------------|-------|
| Baseline (mean) | 18.4 | 12% | — |
| Linear Regression | 14.2 | 31% | — |
| Random Forest | 9.8 | 52% | — |
| **XGBoost + Graph Features** | **6.3** | **71%** | ✅ Best model |

> **Graph feature advantage**: Adding betweenness centrality, hub delay probability, and segment load factor reduced MAE by **35%** compared to XGBoost without graph features.

### Top 5 Bottleneck Hubs

| Rank | Hub | Betweenness Centrality | Avg Delay (hrs) | Risk Score |
|------|-----|----------------------|-----------------|------------|
| 1 | Gurgaon (DLH) | 0.847 | 11.2 | 94.3 |
| 2 | Mumbai (BOM) | 0.791 | 9.8 | 89.1 |
| 3 | Bangalore (BLR) | 0.763 | 10.4 | 87.6 |
| 4 | Chennai (MAA) | 0.698 | 8.9 | 82.4 |
| 5 | Hyderabad (HYD) | 0.634 | 9.1 | 78.9 |

### Network Statistics

| Metric | Value |
|--------|-------|
| Total trip segments | 144,867 |
| Unique facilities (nodes) | 1,508 |
| Unique corridors (edges) | 12,934 |
| Corridors with avg delay > 0 | **83%** |
| Average delay multiplier | **2.22×** |
| Network density | 0.0057 |
| Avg clustering coefficient | 0.31 |

---

## 📂 Output Files

| File | Location | Description |
|------|----------|-------------|
| `delivery_data.csv` | `output/data/raw/` | Original 144,867-row Delhivery dataset |
| `bottleneck_hubs.csv` | `output/data/processed/` | Top 20 hubs with centrality, delay & risk metrics |
| `corridor_audit.csv` | `output/data/processed/` | Top 50 delayed corridors with statistical tests |
| `predictions.csv` | `output/data/processed/` | Test-set predictions from XGBoost ETA model |
| `ftl_framework.csv` | `output/data/processed/` | FTL vs Carting decision table for all corridors |
| `eta_model.pkl` | `output/models/` | Trained XGBoost ETA regressor |
| `eta_scaler.pkl` | `output/models/` | StandardScaler fitted for ETA features |
| `ftl_model.pkl` | `output/models/` | Trained FTL vs Carting classifier |
| `ftl_scaler.pkl` | `output/models/` | StandardScaler fitted for FTL features |
| `graph.graphml` | `output/models/` | Full NetworkX graph serialised in GraphML format |
| `network_graph.png` | `output/graphs/` | Full 1,508-node network visualisation |
| `delay_heatmap.png` | `output/graphs/` | Delay by route_type × time_of_day heatmap |
| `mae_comparison.png` | `output/graphs/` | Model MAE comparison bar chart |
| `feature_importance.png` | `output/graphs/` | Top 15 XGBoost feature importances |
| `residual_plot.png` | `output/graphs/` | Actual vs predicted scatter plot |
| `tsp_tour_N10.html` | `output/maps/` | Interactive Leaflet map — top 10 hubs TSP tour |
| `tsp_tour_N1000.html` | `output/maps/` | Interactive Leaflet map — full network TSP tour |
| `corridor_delay_map.html` | `output/maps/` | Interactive Leaflet delay heatmap |
| `network_stats.json` | `code/frontend/public/data/` | Aggregated network KPIs for dashboard |
| `bottleneck_hubs.json` | `code/frontend/public/data/` | Hub intelligence for dashboard cards |
| `risk_scores.json` | `code/frontend/public/data/` | Per-hub risk scoring data |
| `ftl_advisor_rules.json` | `code/frontend/public/data/` | Zero-API FTL recommendation rules |

---

## 🛠 Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Data & Graph** | Python 3.10, NetworkX 3, Pandas, NumPy, SciPy |
| **Machine Learning** | XGBoost, Scikit-learn, Joblib |
| **Visualisation** | Matplotlib, Seaborn, Folium (Leaflet.js) |
| **Frontend** | React 18, Vite, TailwindCSS, Recharts, Leaflet.js |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Notebook** | Jupyter Lab / Notebook |

---

## 🔧 Development Notes

### Regenerate the dashboard build

```bash
cd code/frontend
npm run build
# Output in code/frontend/dist/
```

### Re-run the full analysis pipeline

```bash
cd code/notebooks
python run_pipeline.py
```

### Backend API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/network` | GET | Network-level statistics |
| `/api/hubs` | GET | Bottleneck hub data |
| `/api/corridors` | GET | Delayed corridor audit |
| `/api/model` | GET | ETA model benchmark results |
| `/api/ftl` | GET | FTL advisor rules |
| `/docs` | GET | Interactive Swagger UI |

---

## 👤 Built By

**Utsav Kumar Thakur**

[![GitHub](https://img.shields.io/badge/GitHub-Utsav--Thakur-181717?style=flat-square&logo=github)](https://github.com/Utsav-Thakur)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Utsav%20Thakur-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/utsav-thakur-2b01871b7)

---

<div align="center">

*Built with ⬡ graph theory, 🤖 machine learning, and ☕ too much coffee.*

**⭐ Star this repo if it helped you!**

</div>
