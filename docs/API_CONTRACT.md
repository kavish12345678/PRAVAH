# PRAVAH API Contract

This document defines how the PRAVAH backend communicates with the three AI/ML models developed by the team.

---

## 1. Expiry Risk Model

### Endpoint

`POST /ml/expiry-risk/predict`

### Backend sends

```json
{
  "inventory_id": "INV001",
  "bank_id": "BANK001",
  "component": "PLATELETS",
  "blood_group": "O+",
  "days_to_expiry": 1.8,
  "current_inventory": 18,
  "historical_utilization": 0.35,
  "projected_demand": 10,
  "temperature_stress": 0.2,
  "agitation_status": 1,
  "equipment_health": 0.9
}
```

### Model returns

```json
{
  "inventory_id": "INV001",
  "risk_score": 0.87,
  "risk_level": "HIGH",
  "contributing_features": [
    "Low days to expiry",
    "Low utilization",
    "Temperature stress"
  ],
  "model_version": "expiry-risk-v1"
}
```

> The above values are example values only. They are not real predictions.

---

## 2. Demand Forecasting Model

### Endpoint

`POST /ml/demand-forecast/predict`

### Backend sends

```json
{
  "bank_id": "BANK002",
  "component": "PLATELETS",
  "blood_group": "O+",
  "historical_usage": [
    8,
    10,
    9,
    12,
    11,
    13,
    10
  ],
  "current_inventory": 10
}
```

### Model returns

```json
{
  "bank_id": "BANK002",
  "component": "PLATELETS",
  "blood_group": "O+",
  "forecast": {
    "1_day": 12,
    "3_day": 16,
    "7_day": 20
  },
  "model_version": "demand-v1"
}
```

> The above values are example values only. They are not real predictions.

---

## 3. Equipment Anomaly Model

### Endpoint

`POST /ml/equipment-anomaly/predict`

### Backend sends

```json
{
  "equipment_id": "EQ001",
  "bank_id": "BANK001",
  "telemetry": {
    "temperature": [
      3.1,
      3.0,
      3.2,
      8.7,
      3.1
    ],
    "excursion_duration": 15,
    "excursion_frequency": 2
  }
}
```

### Model returns

```json
{
  "equipment_id": "EQ001",
  "anomaly_score": 0.91,
  "status": "ANOMALY",
  "model_version": "equipment-v1"
}
```

> The above values are example values only. They are not real predictions.

---

## 4. Backend Integration Flow

The backend combines the outputs of all three models.

```text
Expiry Risk Model
        |
        v
    Risk Score
        |
        +-------------------+
                            |
Demand Forecast Model       |
        |                   |
        v                   |
Projected Shortage          |
        |                   |
        +---------+---------+
                  |
Equipment Anomaly Model
        |
        v
Equipment Status
        |
        +---------+
                  |
                  v
        PRAVAH Decision Layer
                  |
                  v
        Surplus / Shortage Detection
                  |
                  v
          Supply-Demand Matching
                  |
                  v
          Optimization Engine
                  |
                  v
        Route + Vehicle Check
                  |
                  v
          Human Approval
                  |
                  v
             Audit Record
```

---

## 5. Model Integration Requirements

Each ML team member must provide:

1. Training code
2. Preprocessing code
3. Saved trained model
4. Prediction code/interface
5. Sample input
6. Sample output
7. Model version
8. README with setup and usage instructions

---

## 6. Integration Rule

The PRAVAH backend must not depend on the internal implementation of any ML model.

The backend only depends on the agreed input and output formats defined in this document.

This allows the three ML models to be developed independently and integrated later.
