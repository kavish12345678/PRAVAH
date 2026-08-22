import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

def run_greedy_redistribution(target_date="2026-08-21", max_travel_hours=4.0):
    """
    Phase 1 Optimizer: Greedy Nearest-Feasible Donor Matching.
    Matches surplus platelet inventory at donor banks to shortage/high-risk recipient banks
    subject to geographic proximity, vehicle constraints, and remaining shelf life.
    """
    targets_path = os.path.join(DATA_DIR, "prediction_targets.csv")
    transport_path = os.path.join(DATA_DIR, "transport.csv")
    
    df_targets = pd.read_csv(targets_path)
    df_transport = pd.read_csv(transport_path)
    
    df_day = df_targets[df_targets["date"] == target_date].copy()
    
    # Donor banks: Positive transferable surplus and low wastage risk
    donors = df_day[df_day["transferable_surplus_units"] > 0].copy()
    
    # Recipient banks: High stockout risk score (> 0.70) or unfulfilled requests
    recipients = df_day[(df_day["stockout_risk_score"] > 0.70) & (df_day["demand_next_72h"] > df_day["current_stock"])].copy()
    recipients["deficit_units"] = np.maximum(1, recipients["demand_next_72h"] - recipients["current_stock"])

    recommendations = []
    donor_surplus = donors.set_index("bank_id")["transferable_surplus_units"].to_dict()
    recipient_deficit = recipients.set_index("bank_id")["deficit_units"].to_dict()

    # Pre-index transport edges
    edges = df_transport.sort_values("travel_time_min")

    for _, row in edges.iterrows():
        src = row["source_bank"]
        dst = row["destination_bank"]
        travel_hours = row["travel_time_min"] / 60.0

        if travel_hours > max_travel_hours:
            continue

        if src in donor_surplus and dst in recipient_deficit:
            avail = donor_surplus[src]
            needed = recipient_deficit[dst]

            if avail > 0 and needed > 0:
                units = min(avail, needed, int(row["capacity"]))
                if units > 0:
                    donor_surplus[src] -= units
                    recipient_deficit[dst] -= units

                    recommendations.append({
                        "recommendation_id": f"REC-{target_date}-{len(recommendations)+1:04d}",
                        "date": target_date,
                        "source_bank": src,
                        "destination_bank": dst,
                        "platelet_type": "RDP",
                        "recommended_units": int(units),
                        "distance_km": round(float(row["distance_km"]), 2),
                        "travel_time_min": int(row["travel_time_min"]),
                        "vehicle_id": row["vehicle_id"],
                        "refrigerated": bool(row["refrigerated"]),
                        "expected_wastage_reduced": int(units),
                        "expected_shortage_reduced": int(units),
                        "priority": "High" if travel_hours < 2.0 else "Medium",
                        "reason": "Balance surplus against predicted 72-hour stockout risk"
                    })

    df_rec = pd.DataFrame(recommendations)
    return df_rec

if __name__ == "__main__":
    recs = run_greedy_redistribution()
    print(f"Generated {len(recs)} redistribution recommendations for 2026-08-21.")
    if len(recs) > 0:
        print(recs.head())
