"""Verification test suite for PRAVAH ML integration."""

import os
import sys
from pathlib import Path

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import json
from api.ml import (
    ExpiryRiskRequest,
    DemandForecastRequest,
    EquipmentAnomalyRequest,
    TelemetryData,
    predict_expiry_risk,
    predict_demand_forecast,
    predict_equipment_anomaly,
)
from api.intelligence import get_intelligence_status
from services.ml_service import demand_service, expiry_service, anomaly_service, optimization_service

def test_intelligence_status():
    status = get_intelligence_status()
    assert status["ready"] is True
    assert status["mode"] == "ml-gbdt-lp-optimization"
    assert "HistGradientBoosting" in status["models"]["demand_forecasting"]
    assert "HistGradientBoosting" in status["models"]["expiry_risk"]
    assert "IsolationForest" in status["models"]["cold_chain_anomaly"]
    print("✓ GET /api/intelligence/status passed:")
    print(json.dumps(status, indent=2))

def test_expiry_risk_endpoint():
    req = ExpiryRiskRequest(
        inventory_id="INV001",
        bank_id="BANK001",
        component="PLATELETS",
        blood_group="O+",
        days_to_expiry=1.8,
        current_inventory=18,
        historical_utilization=0.35,
        projected_demand=10.0,
        temperature_stress=0.2,
        agitation_status=1,
        equipment_health=0.9,
    )
    res = predict_expiry_risk(req)
    assert res["inventory_id"] == "INV001"
    assert "risk_score" in res
    assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert isinstance(res["contributing_features"], list)
    assert len(res["contributing_features"]) > 0
    print("\n✓ POST /ml/expiry-risk/predict passed:")
    print(json.dumps(res, indent=2))

def test_demand_forecast_endpoint():
    req = DemandForecastRequest(
        bank_id="BANK002",
        component="PLATELETS",
        blood_group="O+",
        historical_usage=[8, 10, 9, 12, 11, 13, 10],
        current_inventory=10,
    )
    res = predict_demand_forecast(req)
    assert res["bank_id"] == "BANK002"
    assert "forecast" in res
    assert "1_day" in res["forecast"]
    assert "3_day" in res["forecast"]
    assert "7_day" in res["forecast"]
    print("\n✓ POST /ml/demand-forecast/predict passed:")
    print(json.dumps(res, indent=2))

def test_equipment_anomaly_endpoint():
    req = EquipmentAnomalyRequest(
        equipment_id="EQ001",
        bank_id="BANK001",
        telemetry=TelemetryData(
            temperature=[3.1, 3.0, 3.2, 8.7, 3.1],
            excursion_duration=15,
            excursion_frequency=2,
        ),
    )
    res = predict_equipment_anomaly(req)
    assert res["equipment_id"] == "EQ001"
    assert "anomaly_score" in res
    assert res["status"] in ["ANOMALY", "NORMAL"]
    print("\n✓ POST /ml/equipment-anomaly/predict passed:")
    print(json.dumps(res, indent=2))

def test_lp_network_flow_optimization():
    donors = {1: 30, 2: 20}
    recipients = {3: 25, 4: 15}
    edges = [
        {"source_bank": 1, "destination_bank": 3, "distance_km": 40.0, "travel_time_min": 50, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": 1, "destination_bank": 4, "distance_km": 120.0, "travel_time_min": 150, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": 2, "destination_bank": 3, "distance_km": 150.0, "travel_time_min": 180, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": 2, "destination_bank": 4, "distance_km": 30.0, "travel_time_min": 40, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
    ]
    routes = optimization_service.solve_network_flow(donors, recipients, edges)
    assert len(routes) > 0
    total_flow = sum(r["quantity"] for r in routes)
    assert total_flow == 40  # min(50 total surplus, 40 total deficit)
    print(f"\n✓ Linear Programming HiGHS Optimization passed: {len(routes)} routes generated, total redistributed units: {total_flow}")
    for r in routes:
        print(f"   Route: Bank {r['source_bank']} -> Bank {r['destination_bank']} | Units: {r['quantity']} | Travel: {r['travel_time_min']}m")

def test_model_loading():
    assert demand_service.artifact_24h is not None, "24h Demand Model should be loaded"
    assert demand_service.artifact_72h is not None, "72h Demand Model should be loaded"
    assert expiry_service.prob_model is not None, "Expiry Risk Regressor should be loaded"
    assert expiry_service.classifier_model is not None, "Expiry Risk Classifier should be loaded"
    assert anomaly_service.model is not None, "Cold Chain Isolation Forest should be loaded"
    print("\n✓ All 4 model artifacts verified loaded in memory successfully!")

if __name__ == "__main__":
    print("=" * 70)
    print("   PRAVAH: VERIFYING INTEGRATION OF ALL MACHINE LEARNING MODELS")
    print("=" * 70)
    test_model_loading()
    test_intelligence_status()
    test_expiry_risk_endpoint()
    test_demand_forecast_endpoint()
    test_equipment_anomaly_endpoint()
    test_lp_network_flow_optimization()
    print("\n" + "=" * 70)
    print("   ALL VERIFICATION TESTS COMPLETED AND PASSED!")
    print("=" * 70)
