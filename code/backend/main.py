import os
import json
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from schemas import (
    NetworkStatsResponse,
    HubResponse,
    HubInsight,
    CorridorResponse,
    FTLRuleResponse,
    IntelligenceResponse,
    StrategyMemoResponse,
)

app = FastAPI(
    title="DeliveryIQ API",
    description="Delhivery Logistics Analytics Backend - Serves Pre-computed Graph Intelligence Metrics",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join("public", "data")

# In-memory startup database
try:
    with open(os.path.join(DATA_DIR, "network_stats.json")) as f:
        network_stats = json.load(f)

    with open(os.path.join(DATA_DIR, "bottleneck_hubs.json")) as f:
        bottleneck_hubs = json.load(f)

    with open(os.path.join(DATA_DIR, "corridor_audit.json")) as f:
        corridor_audit = json.load(f)

    with open(os.path.join(DATA_DIR, "model_benchmark.json")) as f:
        model_benchmark = json.load(f)

    with open(os.path.join(DATA_DIR, "feature_importance.json")) as f:
        feature_importance = json.load(f)

    with open(os.path.join(DATA_DIR, "ftl_advisor_rules.json")) as f:
        ftl_advisor_rules = json.load(f)

    with open(os.path.join(DATA_DIR, "hub_insights.json")) as f:
        hub_insights = json.load(f)

    with open(os.path.join(DATA_DIR, "corridor_recommendations.json")) as f:
        corridor_recommendations = json.load(f)

    with open(os.path.join(DATA_DIR, "risk_scores.json")) as f:
        risk_scores = json.load(f)

    with open(os.path.join(DATA_DIR, "network_intelligence.json")) as f:
        network_intelligence = json.load(f)

    print("Success: Loaded all pre-computed JSON files into memory.")
except Exception as e:
    print(f"Startup Warning: Failed to load some JSON files from {DATA_DIR}. Error: {e}")
    # fallback empty definitions
    network_stats = {}
    bottleneck_hubs = []
    corridor_audit = []
    model_benchmark = {}
    feature_importance = {}
    ftl_advisor_rules = []
    hub_insights = []
    corridor_recommendations = []
    risk_scores = []
    network_intelligence = {}


# Helpers for Hub operations
def process_hub_data(hub_dict: dict) -> dict:
    score = hub_dict.get("composite_score", 0.0) * 1000
    tier = "Medium"
    if score > 10:
        tier = "Critical"
    elif score > 1:
        tier = "High"
    
    display_score = min(100, round(score * 4.5 + 10))
    
    # Merge risk_score
    risk_val = None
    for rs in risk_scores:
        if rs.get("hub_id") == hub_dict["node"]:
            risk_val = rs.get("risk_score")
            break
            
    # Merge insight
    insight = None
    for ins in hub_insights:
        if ins.get("hub_id") == hub_dict["node"]:
            insight = ins
            break
            
    return {
        **hub_dict,
        "display_score": display_score,
        "tier": tier,
        "insight": insight,
        "risk_score": risk_val
    }


# Endpoints
@app.get("/api/network/stats", response_model=NetworkStatsResponse)
def get_network_stats():
    return network_stats


@app.get("/api/hubs", response_model=List[HubResponse])
def get_hubs(
    risk_level: str = Query("all", description="Filter hubs: all, Critical, High, Medium"),
    limit: int = Query(20, description="Max hubs to return")
):
    processed = [process_hub_data(h) for h in bottleneck_hubs]
    
    if risk_level.lower() != "all":
        processed = [h for h in processed if h["tier"].lower() == risk_level.lower()]
        
    return processed[:limit]


@app.get("/api/hubs/{hub_id}", response_model=HubResponse)
def get_hub_by_id(hub_id: str):
    matched_hub = None
    for h in bottleneck_hubs:
        if h["node"] == hub_id:
            matched_hub = h
            break
            
    if not matched_hub:
        raise HTTPException(status_code=404, detail=f"Hub with node ID {hub_id} not found.")
        
    return process_hub_data(matched_hub)


@app.get("/api/corridors", response_model=List[CorridorResponse])
def get_corridors(
    route_type: str = Query("all", description="Filter route type: all, FTL, Carting"),
    priority: str = Query("all", description="Filter priority: all, P1, P2, P3"),
    page: int = Query(1, ge=1, description="Page index"),
    limit: int = Query(20, ge=1, description="Items per page")
):
    processed = []
    for c in corridor_audit:
        rec = None
        for r in corridor_recommendations:
            if r["source"] == c["source_center"] and r["destination"] == c["destination_center"]:
                rec = r
                break
                
        processed.append({
            **c,
            "priority": rec["priority"] if rec else "P3",
            "fix": rec["fix"] if rec else "Standard Audit Required",
            "estimated_time_saved_pct": rec["estimated_time_saved_pct"] if rec else 10,
            "reasoning": rec["reasoning"] if rec else "Standard audit fallback."
        })
        
    # Filters
    if route_type.lower() != "all":
        processed = [c for c in processed if c["route_type_dominant"].lower() == route_type.lower()]
        
    if priority.lower() != "all":
        processed = [c for c in processed if c["priority"].lower() == priority.lower()]
        
    # Pagination
    offset = (page - 1) * limit
    return processed[offset:offset + limit]


@app.get("/api/model/benchmark")
def get_model_benchmark():
    return model_benchmark


@app.get("/api/model/feature-importance")
def get_feature_importance():
    return feature_importance


@app.get("/api/ftl/lookup", response_model=FTLRuleResponse)
def ftl_lookup(
    distance_band: str = Query(..., description="Short, Medium, or Long"),
    time_of_day: str = Query(..., description="Morning, Afternoon, Evening, Night"),
    hub_tier: str = Query(..., description="Low, Medium, High")
):
    matched = None
    for r in ftl_advisor_rules:
        # Match band prefix or substring (e.g. 'Medium' in 'Medium (50-200km)')
        band_match = distance_band.lower() in r["distance_band"].lower()
        tod_match = time_of_day.lower() == r["time_of_day"].lower()
        tier_match = hub_tier.lower() == r["betweenness_tier"].lower()
        
        if band_match and tod_match and tier_match:
            matched = r
            break
            
    if not matched:
        raise HTTPException(
            status_code=404, 
            detail=f"No matching FTL advisor rule found for Band={distance_band}, TOD={time_of_day}, Tier={hub_tier}."
        )
        
    return matched


@app.get("/api/intelligence", response_model=IntelligenceResponse)
def get_intelligence():
    return network_intelligence


@app.get("/api/risk-scores")
def get_risk_scores():
    return risk_scores


@app.get("/api/memo", response_model=StrategyMemoResponse)
def get_memo():
    # ConstructStrategy memo content
    return {
        "to": "Head of Network Operations, Delhivery Board",
        "from": "Utsav Kumar Thakur (Network IQ Group)",
        "subject": "Delhivery Hub & Corridor Bottleneck Mitigation Strategy",
        "date": "July 2, 2026",
        "summary": (
            "An end-to-end topological analysis of Delhivery's network (144,867 segments) reveals "
            "that 83% of corridors experience significant transit delays compared to standard OSRM models. "
            "Using graph theory metrics (Betweenness Centrality), we have identified that a small subset of "
            "5 hubs handles a disproportionate amount of transit volume, leading to systemic SLA breaches. "
            "By implementing target capacity upgrades and route shifts, Delhivery can recover up to "
            "₹6.73M monthly penalty leakages and improve SLA compliance by 23%."
        ),
        "top_hubs": [
            { "rank": 1, "name": "Gurgaon_Bilaspur_HB (Haryana)", "betweenness": "0.0824", "slaBreach": "79.2%", "trips": "12,408", "fix": "Facility Upgrade" },
            { "rank": 2, "name": "Bangalore_Nelamangala_H (Karnataka)", "betweenness": "0.0614", "slaBreach": "62.4%", "trips": "9,812", "fix": "Load Balancer Corridor" },
            { "rank": 3, "name": "Mumbai_Hub_HB (Maharashtra)", "betweenness": "0.0482", "slaBreach": "58.7%", "trips": "8,420", "fix": "Facility Upgrade" },
            { "rank": 4, "name": "Pune_HB (Maharashtra)", "betweenness": "0.0415", "slaBreach": "54.2%", "trips": "7,150", "fix": "Route-Type Shift" },
            { "rank": 5, "name": "Kolkata_HB (West Bengal)", "betweenness": "0.0387", "slaBreach": "51.8%", "trips": "6,840", "fix": "Facility Upgrade" }
        ],
        "interventions": {
            "capacity_upgrades": "Expand sorting lanes and inbound gate capacities at Gurgaon and Mumbai hubs.",
            "route_type_conversion": "Shift corridors exceeding 200km from Carting to FTL to utilize highway speedups.",
            "load_balancers": "Establish direct secondary routes bypassing Gurgaon Bilaspur for Northern transits."
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
