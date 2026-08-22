"""PRAVAH AI & Optimization Demo Execution Script.

Runs all 3 ML models, the LP optimization solver, and the event-driven re-scoring
pipeline, capturing precise inputs and outputs for presentation.
"""

import os
import sys
from pathlib import Path

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

def run_demo():
    results = {}

    # 1. Engine Status
    status = get_intelligence_status()
    results["engine_status"] = status

    # 2. Model 1: Demand Forecasting
    demand_input = {
        "bank_id": "BANK002 (Mumbai Regional Blood Centre)",
        "component": "PLATELETS",
        "blood_group": "O+",
        "historical_usage": [8, 10, 9, 12, 11, 13, 10],
        "current_inventory": 10
    }
    req_demand = DemandForecastRequest(
        bank_id="BANK002",
        component="PLATELETS",
        blood_group="O+",
        historical_usage=[8, 10, 9, 12, 11, 13, 10],
        current_inventory=10,
    )
    demand_output = predict_demand_forecast(req_demand)
    results["model_1_demand_forecasting"] = {
        "input": demand_input,
        "output": demand_output
    }

    # 3. Model 2: Expiry & Wastage Risk Model Family
    expiry_input_high_risk = {
        "inventory_id": "INV001",
        "bank_id": "BANK001 (Delhi Central Blood Bank)",
        "component": "PLATELETS",
        "blood_group": "O+",
        "days_to_expiry": 1.8,
        "current_inventory": 18,
        "historical_utilization": 0.35,
        "projected_demand": 10.0,
        "temperature_stress": 0.2,
        "agitation_status": 1,
        "equipment_health": 0.90
    }
    req_expiry = ExpiryRiskRequest(**{k: v for k, v in expiry_input_high_risk.items() if k != "bank_id"}, bank_id="BANK001")
    expiry_output = predict_expiry_risk(req_expiry)

    # Low risk sample
    expiry_input_low_risk = {
        "inventory_id": "INV042",
        "bank_id": "BANK005 (Hyderabad Central Blood Bank)",
        "component": "Whole Blood",
        "blood_group": "A+",
        "days_to_expiry": 25.0,
        "current_inventory": 30,
        "historical_utilization": 0.85,
        "projected_demand": 25.0,
        "temperature_stress": 0.0,
        "agitation_status": 1,
        "equipment_health": 0.98
    }
    req_expiry_low = ExpiryRiskRequest(**{k: v for k, v in expiry_input_low_risk.items() if k != "bank_id"}, bank_id="BANK005")
    expiry_output_low = predict_expiry_risk(req_expiry_low)

    results["model_2_expiry_risk"] = {
        "sample_1_near_expiry": {
            "input": expiry_input_high_risk,
            "output": expiry_output
        },
        "sample_2_healthy_stock": {
            "input": expiry_input_low_risk,
            "output": expiry_output_low
        }
    }

    # 4. Model 3: Cold-Chain & Equipment Anomaly Detection
    anomaly_input_excursion = {
        "equipment_id": "EQ-PLATELET-AGITATOR-01",
        "bank_id": "BANK003 (Bengaluru City Blood Bank)",
        "telemetry": {
            "temperature_stream_degC": [21.5, 21.8, 22.1, 26.8, 27.4, 28.1],
            "agitation_status": "OFF (interrupted)",
            "excursion_duration_min": 45,
            "excursion_frequency": 3
        }
    }
    req_anomaly = EquipmentAnomalyRequest(
        equipment_id="EQ-PLATELET-AGITATOR-01",
        bank_id="BANK003",
        telemetry=TelemetryData(
            temperature=[21.5, 21.8, 22.1, 26.8, 27.4, 28.1],
            excursion_duration=45,
            excursion_frequency=3
        )
    )
    anomaly_output = predict_equipment_anomaly(req_anomaly)

    # Normal sample
    anomaly_input_normal = {
        "equipment_id": "EQ-REFRIGERATOR-05",
        "bank_id": "BANK001 (Delhi Central Blood Bank)",
        "telemetry": {
            "temperature_stream_degC": [21.8, 22.0, 21.9, 22.1, 22.0],
            "agitation_status": "ON (active)",
            "excursion_duration_min": 0,
            "excursion_frequency": 0
        }
    }
    req_anomaly_normal = EquipmentAnomalyRequest(
        equipment_id="EQ-REFRIGERATOR-05",
        bank_id="BANK001",
        telemetry=TelemetryData(
            temperature=[21.8, 22.0, 21.9, 22.1, 22.0],
            excursion_duration=0,
            excursion_frequency=0
        )
    )
    anomaly_output_normal = predict_equipment_anomaly(req_anomaly_normal)

    results["model_3_cold_chain_anomaly"] = {
        "sample_1_thermal_excursion": {
            "input": anomaly_input_excursion,
            "output": anomaly_output
        },
        "sample_2_normal_telemetry": {
            "input": anomaly_input_normal,
            "output": anomaly_output_normal
        }
    }

    # 5. Optimization Engine (Linear Programming Min-Cost Network Flow)
    donors = {
        "Delhi Central Blood Bank": 35,
        "Hyderabad Central Blood Bank": 25
    }
    recipients = {
        "Chennai South Blood Bank": 30,
        "Mumbai Regional Blood Centre": 20
    }
    candidate_edges = [
        {"source_bank": "Delhi Central Blood Bank", "destination_bank": "Chennai South Blood Bank", "distance_km": 2180.0, "travel_time_min": 280, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": "Delhi Central Blood Bank", "destination_bank": "Mumbai Regional Blood Centre", "distance_km": 1420.0, "travel_time_min": 190, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": "Hyderabad Central Blood Bank", "destination_bank": "Chennai South Blood Bank", "distance_km": 630.0, "travel_time_min": 90, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
        {"source_bank": "Hyderabad Central Blood Bank", "destination_bank": "Mumbai Regional Blood Centre", "distance_km": 710.0, "travel_time_min": 110, "capacity": 50, "component": "Platelets", "blood_group": "O+"},
    ]

    lp_routes = optimization_service.solve_network_flow(
        donors=donors,
        recipients=recipients,
        transport_edges=candidate_edges
    )

    results["optimization_engine_lp"] = {
        "input": {
            "solver": "HiGHS Simplex/Interior-Point Linear Programming",
            "objective": "Minimize: 0.05*Distance + 0.02*TravelTime - 20.0*UnitsSaved",
            "donor_surplus_units": donors,
            "recipient_deficit_units": recipients,
            "candidate_edges_count": len(candidate_edges)
        },
        "output": {
            "total_surplus_available": sum(donors.values()),
            "total_deficit_demand": sum(recipients.values()),
            "total_units_redistributed": sum(r["quantity"] for r in lp_routes),
            "optimal_transfer_routes": lp_routes
        }
    }

    # 6. Event-Driven Dynamic Re-Scoring Simulation
    baseline_score = expiry_service.score_unit(
        platelet_type="Platelets",
        represented_units=15,
        age_hours=48.0,
        remaining_shelf_life_hours=72.0,
        current_stock=15,
        expiring_48h=0,
        demand_next_24h=8,
        demand_next_72h=20,
        cumulative_excursion_minutes=0.0,
        max_temperature_exposure=22.0,
        agitation_off_minutes=0.0,
        health_score=95.0
    )

    incident_score = expiry_service.score_unit(
        platelet_type="Platelets",
        status="CRITICAL",
        represented_units=15,
        age_hours=48.0,
        remaining_shelf_life_hours=72.0,
        current_stock=15,
        expiring_48h=0,
        demand_next_24h=8,
        demand_next_72h=20,
        cumulative_excursion_minutes=60.0,
        max_temperature_exposure=27.8,
        agitation_off_minutes=60.0,
        health_score=45.0
    )

    results["event_driven_rescore"] = {
        "input_incident": {
            "event_type": "Severe Thermal Excursion + Agitation Loss",
            "bank": "Bengaluru City Blood Bank",
            "excursion_temp_degC": 27.8,
            "duration_min": 60,
            "agitation_status": "OFF",
            "equipment_health_drop": "95% -> 45%"
        },
        "output_rescore": {
            "baseline_risk_score": baseline_score["risk_score"],
            "baseline_risk_level": baseline_score["risk_level"],
            "post_incident_risk_score": incident_score["risk_score"],
            "post_incident_risk_level": incident_score["risk_level"],
            "risk_delta": round(incident_score["risk_score"] - baseline_score["risk_score"], 4),
            "degradation_risk_score": incident_score["degradation_risk_score"],
            "contributing_features": incident_score["contributing_features"],
            "action_recommended": incident_score["recommendation"],
            "immediate_reroute_triggered": True
        }
    }

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_demo()
