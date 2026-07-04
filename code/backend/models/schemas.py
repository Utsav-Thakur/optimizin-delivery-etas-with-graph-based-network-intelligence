from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class NetworkStatsResponse(BaseModel):
    total_nodes: int
    total_edges: int
    graph_density: float
    strongly_connected_components: int

class HubInsightReasoning(BaseModel):
    betweenness_percentile: int
    sla_breach_pct: float
    in_out_ratio: float
    dominant_route_type: str
    busiest_time: str

class HubInsight(BaseModel):
    hub_id: str
    hub_name: str
    risk_level: str
    intervention: str
    intervention_type: str
    delay_reduction_pct: int
    trips_recovered_monthly: int
    insight_text: str
    reasoning: HubInsightReasoning

class HubResponse(BaseModel):
    node: str
    name: str
    state: str
    betweenness: float
    clustering: float
    in_degree: int
    out_degree: int
    avg_delay_ratio: float
    pct_ftl: float
    dominant_route_type: str
    peak_time_of_day: str
    pct_sla_breach: float
    outbound_trip_count: float
    composite_score: float
    betweenness_rank: int
    composite_rank: int
    display_score: int
    tier: str
    insight: Optional[HubInsight] = None
    risk_score: Optional[float] = None

class CorridorResponse(BaseModel):
    source_center: str
    destination_center: str
    median_delay_ratio: float
    trip_count: int
    pct_delayed: float
    avg_distance: float
    route_type_dominant: str
    peak_delay_time: str
    priority: str
    fix: str
    estimated_time_saved_pct: int
    reasoning: str

class FTLRuleResponse(BaseModel):
    distance_band: str
    time_of_day: str
    betweenness_tier: str
    recommended_route: str
    confidence: float
    expected_delay_ratio: float
    reasoning_text: str

class QuickWinItem(BaseModel):
    source: str
    destination: str
    delay_ratio: float
    fix: str
    priority: str
    estimated_time_saved_pct: int
    reasoning: str

class StructuralRiskItem(BaseModel):
    node: str
    name: str
    betweenness: float
    pct_sla_breach: float
    outbound_trip_count: float

class IntelligenceResponse(BaseModel):
    network_health_score: float
    critical_hubs_count: int
    revenue_at_risk_estimate: int
    top_intervention: str
    time_pattern_insight: str
    ftl_vs_carting_insight: str
    quick_wins: List[QuickWinItem]
    structural_risks: List[StructuralRiskItem]

class StrategyMemoHub(BaseModel):
    rank: int
    name: str
    betweenness: str
    slaBreach: str
    trips: str
    fix: str

class StrategyMemoResponse(BaseModel):
    to: str
    from_person: str = Field(..., alias="from")
    subject: str
    date: str
    summary: str
    top_hubs: List[StrategyMemoHub]
    interventions: Dict[str, str]
