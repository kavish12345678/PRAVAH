import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

def get_demand_dataset(split_date="2026-09-13"):
    """
    Builds the feature matrix and targets for Model 1: Demand Forecasting.
    Combines prediction_targets.csv with bank_profile_features.csv and platelet_demand.csv.
    """
    targets_path = os.path.join(DATA_DIR, "prediction_targets.csv")
    bank_profiles_path = os.path.join(DATA_DIR, "bank_profile_features.csv")
    demand_path = os.path.join(DATA_DIR, "platelet_demand.csv")

    df_targets = pd.read_csv(targets_path)
    df_bank = pd.read_csv(bank_profiles_path)
    df_demand = pd.read_csv(demand_path)

    # Merge profile features
    profile_cols = [
        "bank_id", "district_bank_count", "state_bank_count", 
        "capacity_proxy", "dengue_monsoon_multiplier", "facility_demand_multiplier", "discard_target"
    ]
    df = df_targets.merge(df_bank[profile_cols], on="bank_id", how="left")

    # Merge detailed demand history
    demand_cols = ["bank_id", "date", "platelet_transfused", "platelet_returned", "emergency_requests", "routine_requests"]
    df = df.merge(df_demand[demand_cols], on=["bank_id", "date"], how="left")

    # Facility tier one-hot/ordinal encoding
    tier_mapping = {
        "peripheral_center": 0,
        "district_center": 1,
        "urban_referral": 2,
        "metro_tertiary_hub": 3
    }
    df["tier_code"] = df["facility_tier"].map(tier_mapping).fillna(1).astype(int)

    feature_cols = [
        "tier_code",
        "current_stock",
        "expiring_48h",
        "platelet_requests",
        "platelet_issued",
        "unfulfilled_requests",
        "emergency_requests",
        "routine_requests",
        "platelet_transfused",
        "platelet_returned",
        "district_bank_count",
        "state_bank_count",
        "capacity_proxy",
        "dengue_monsoon_multiplier",
        "facility_demand_multiplier",
        "discard_target"
    ]

    target_24h = "demand_next_24h"
    target_72h = "demand_next_72h"

    # Fill any missing values
    df[feature_cols] = df[feature_cols].fillna(0)

    train_mask = df["date"] <= split_date
    val_mask = df["date"] > split_date

    X_train = df.loc[train_mask, feature_cols]
    y_train_24h = df.loc[train_mask, target_24h]
    y_train_72h = df.loc[train_mask, target_72h]

    X_val = df.loc[val_mask, feature_cols]
    y_val_24h = df.loc[val_mask, target_24h]
    y_val_72h = df.loc[val_mask, target_72h]

    meta_train = df.loc[train_mask, ["bank_id", "date", "facility_tier"]]
    meta_val = df.loc[val_mask, ["bank_id", "date", "facility_tier"]]

    return {
        "X_train": X_train,
        "y_train_24h": y_train_24h,
        "y_train_72h": y_train_72h,
        "X_val": X_val,
        "y_val_24h": y_val_24h,
        "y_val_72h": y_val_72h,
        "feature_names": feature_cols,
        "meta_train": meta_train,
        "meta_val": meta_val,
        "full_df": df
    }

def get_expiry_risk_dataset(split_ratio=0.8):
    """
    Builds the feature matrix and targets for Model 2: Expiry & Wastage Risk Model.
    Uses unit_expiry_risk_features.csv with operational, telemetry, and equipment health factors.
    """
    unit_risk_path = os.path.join(DATA_DIR, "unit_expiry_risk_features.csv")
    df = pd.read_csv(unit_risk_path)

    # Encode categoricals
    type_mapping = {"RDP": 0, "SDP": 1, "Platelet Concentrate": 2}
    tier_mapping = {
        "peripheral_center": 0,
        "district_center": 1,
        "urban_referral": 2,
        "metro_tertiary_hub": 3
    }
    status_mapping = {"OK": 0, "WARNING": 1, "CRITICAL": 2}

    df["platelet_type_code"] = df["platelet_type"].map(type_mapping).fillna(0).astype(int)
    df["tier_code"] = df["facility_tier"].map(tier_mapping).fillna(1).astype(int)
    df["status_code"] = df["status"].map(status_mapping).fillna(0).astype(int)

    feature_cols = [
        "platelet_type_code",
        "tier_code",
        "status_code",
        "represented_units",
        "age_hours",
        "remaining_shelf_life_hours",
        "current_stock",
        "expiring_48h",
        "demand_next_24h",
        "demand_next_72h",
        "stockout_risk_score",
        "wastage_risk_score",
        "cumulative_excursion_minutes",
        "max_temperature_exposure",
        "agitation_off_minutes",
        "health_score",
        "issue_probability"
    ]

    # Primary targets
    # 1. Regression target: expiry_risk_probability
    # 2. Binary classification target: label_will_expire_unused
    # 3. Degradation risk score
    target_prob = "expiry_risk_probability"
    target_bin = "label_will_expire_unused"
    target_deg = "degradation_risk_score"

    df[feature_cols] = df[feature_cols].fillna(0)

    # Train / val split (deterministic index split to preserve distribution)
    n_samples = len(df)
    n_train = int(n_samples * split_ratio)
    
    # Shuffle with fixed seed
    shuffled_idx = np.random.RandomState(42).permutation(n_samples)
    train_idx = shuffled_idx[:n_train]
    val_idx = shuffled_idx[n_train:]

    X_train = df.iloc[train_idx][feature_cols]
    y_train_prob = df.iloc[train_idx][target_prob]
    y_train_bin = df.iloc[train_idx][target_bin]
    y_train_deg = df.iloc[train_idx][target_deg]

    X_val = df.iloc[val_idx][feature_cols]
    y_val_prob = df.iloc[val_idx][target_prob]
    y_val_bin = df.iloc[val_idx][target_bin]
    y_val_deg = df.iloc[val_idx][target_deg]

    meta_train = df.iloc[train_idx][["unit_id", "inventory_id", "bank_id", "risk_band", "unit_recommendation"]]
    meta_val = df.iloc[val_idx][["unit_id", "inventory_id", "bank_id", "risk_band", "unit_recommendation"]]

    return {
        "X_train": X_train,
        "y_train_prob": y_train_prob,
        "y_train_bin": y_train_bin,
        "y_train_deg": y_train_deg,
        "X_val": X_val,
        "y_val_prob": y_val_prob,
        "y_val_bin": y_val_bin,
        "y_val_deg": y_val_deg,
        "feature_names": feature_cols,
        "meta_train": meta_train,
        "meta_val": meta_val,
        "full_df": df
    }

def get_cold_chain_telemetry():
    """
    Loads raw cold chain minute telemetry and computes rolling anomaly features.
    """
    cold_chain_path = os.path.join(DATA_DIR, "cold_chain.csv")
    df = pd.read_csv(cold_chain_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["agitation_num"] = (df["agitation_status"] == "ON").astype(int)
    return df
