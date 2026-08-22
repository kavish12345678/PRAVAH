import os
import pandas as pd
import numpy as np
from scipy.optimize import linprog

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

def solve_network_flow_optimization(target_date="2026-08-21", max_travel_hours=5.0):
    """
    Phase 2 / 4 Optimizer: Formal Linear Programming / Min-Cost Network Flow Optimization.
    Minimizes: Transport Cost + Unmet Demand Penalty - Wastage Reduction Value
    Subject to:
      1. Source available surplus constraints (Supply bounds)
      2. Destination predicted shortage constraints (Demand bounds)
      3. Edge vehicle capacity & maximum travel time bounds
    """
    targets_path = os.path.join(DATA_DIR, "prediction_targets.csv")
    transport_path = os.path.join(DATA_DIR, "transport.csv")
    
    df_targets = pd.read_csv(targets_path)
    df_transport = pd.read_csv(transport_path)
    
    df_day = df_targets[df_targets["date"] == target_date].copy()
    
    # Identify donors and recipients
    donors = df_day[df_day["transferable_surplus_units"] > 0].set_index("bank_id")["transferable_surplus_units"].to_dict()
    
    recipients_df = df_day[(df_day["stockout_risk_score"] > 0.60) & (df_day["demand_next_72h"] > df_day["current_stock"])].copy()
    recipients_df["deficit"] = np.maximum(1, recipients_df["demand_next_72h"] - recipients_df["current_stock"])
    recipients = recipients_df.set_index("bank_id")["deficit"].to_dict()

    if not donors or not recipients:
        return pd.DataFrame()

    # Filter candidate transport edges between active donors and recipients
    candidate_edges = df_transport[
        (df_transport["source_bank"].isin(donors.keys())) &
        (df_transport["destination_bank"].isin(recipients.keys())) &
        (df_transport["travel_time_min"] <= max_travel_hours * 60)
    ].copy()

    if candidate_edges.empty:
        return pd.DataFrame()

    candidate_edges = candidate_edges.reset_index(drop=True)
    num_edges = len(candidate_edges)

    # Decision variable x[e] >= 0 : units transferred along edge e
    # Objective: Minimize cost
    # Cost = 0.05 * distance_km + 0.1 * travel_time_min - 50.0 (value of saving platelet unit)
    costs = []
    capacities = []
    for _, edge in candidate_edges.iterrows():
        c = (0.05 * edge["distance_km"]) + (0.02 * edge["travel_time_min"]) - 20.0
        costs.append(c)
        capacities.append(edge["capacity"])

    c = np.array(costs)
    bounds = [(0, cap) for cap in capacities]

    # Constraints:
    # 1. Supply constraints: sum_{e out of i} x[e] <= Donor_Surplus[i]
    # 2. Demand constraints: sum_{e into j} x[e] <= Recipient_Deficit[j]
    unique_donors = list(set(candidate_edges["source_bank"]))
    unique_recipients = list(set(candidate_edges["destination_bank"]))

    A_ub = []
    b_ub = []

    # Donor constraints
    for donor_id in unique_donors:
        row = [1.0 if candidate_edges.iloc[e]["source_bank"] == donor_id else 0.0 for e in range(num_edges)]
        A_ub.append(row)
        b_ub.append(donors[donor_id])

    # Recipient constraints
    for rec_id in unique_recipients:
        row = [1.0 if candidate_edges.iloc[e]["destination_bank"] == rec_id else 0.0 for e in range(num_edges)]
        A_ub.append(row)
        b_ub.append(recipients[rec_id])

    A_ub = np.array(A_ub)
    b_ub = np.array(b_ub)

    # Solve using HiGHS linear programming solver
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

    recommendations = []
    if res.success:
        flow_values = np.round(res.x).astype(int)
        for idx, flow in enumerate(flow_values):
            if flow > 0:
                edge = candidate_edges.iloc[idx]
                src = edge["source_bank"]
                dst = edge["destination_bank"]
                dist = edge["distance_km"]
                tt = edge["travel_time_min"]

                recommendations.append({
                    "recommendation_id": f"LP-OPT-{target_date}-{len(recommendations)+1:04d}",
                    "date": target_date,
                    "source_bank": src,
                    "destination_bank": dst,
                    "platelet_type": "RDP",
                    "recommended_units": int(flow),
                    "distance_km": round(float(dist), 2),
                    "travel_time_min": int(tt),
                    "vehicle_id": edge["vehicle_id"],
                    "refrigerated": bool(edge["refrigerated"]),
                    "expected_wastage_reduced": int(flow),
                    "expected_shortage_reduced": int(flow),
                    "solver_status": "OPTIMAL",
                    "priority": "Critical" if tt < 90 else "High",
                    "reason": "Global LP-optimized minimum-cost surplus routing"
                })

    df_res = pd.DataFrame(recommendations)
    return df_res

if __name__ == "__main__":
    df_opt = solve_network_flow_optimization()
    print(f"LP Optimizer computed {len(df_opt)} optimal transfer routes for 2026-08-21.")
    if len(df_opt) > 0:
        print(df_opt.head())
