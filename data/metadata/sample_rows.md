# Project PRAVAH generated table samples

## blood_banks

| bank_id | name | state | district | city | latitude | longitude | category |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 31003 | Pillar Health Centre | Andaman and Nicobar Islands | South Andaman | Port Blair | 11.653229 | 92.730714 | Charitable |
| 280695 | G.B.Pant Hospital Atlanta Point Medical College | Andaman and Nicobar Islands | South Andaman | Port Blair | 11.716205 | 92.715882 | Government |
| 284580 | Bsu Chc Chodavaram | Andhra Pradesh | Anakapalli | Chodavaram | 16.322369 | 80.434428 | Government |
| 285314 | BSU CHC Veldurthy | Andhra Pradesh | Kurnool | Veldurthy | 15.83654 | 77.997454 | Government |
| 285319 | BSU CHC Repalle | Andhra Pradesh | Bapatla | Repalle | 16.214526 | 80.438119 | Government |

## bank_profile_features

| bank_id | state | district | facility_tier | district_bank_count | state_bank_count | capacity_proxy | dengue_monsoon_multiplier | facility_demand_multiplier | discard_target | regional_calibration_source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31003 | Andaman and Nicobar Islands | South Andaman | peripheral_center | 2 | 2 | 1.779 | 1.06 | 0.68 | 0.24 | India public literature pattern mapped by facility tier and dengue-prone state |
| 280695 | Andaman and Nicobar Islands | South Andaman | urban_referral | 2 | 2 | 4.898 | 1.06 | 1.16 | 0.16 | India public literature pattern mapped by facility tier and dengue-prone state |
| 284580 | Andhra Pradesh | Anakapalli | district_center | 8 | 405 | 3.117 | 1.166 | 0.92 | 0.19 | India public literature pattern mapped by facility tier and dengue-prone state |
| 285314 | Andhra Pradesh | Kurnool | urban_referral | 22 | 405 | 4.295 | 1.166 | 1.16 | 0.16 | India public literature pattern mapped by facility tier and dengue-prone state |
| 285319 | Andhra Pradesh | Bapatla | district_center | 12 | 405 | 3.485 | 1.166 | 0.92 | 0.19 | India public literature pattern mapped by facility tier and dengue-prone state |

## platelet_inventory

| inventory_id | bank_id | date | platelet_type | quantity | collection_date | expiry_date |
| --- | --- | --- | --- | --- | --- | --- |
| INV-280695-20260821-RDP | 280695 | 2026-08-21 | RDP | 16 | 2026-08-20 | 2026-08-25 |
| INV-280695-20260821-SDP | 280695 | 2026-08-21 | SDP | 4 | 2026-08-21 | 2026-08-26 |
| INV-280695-20260821-PLA | 280695 | 2026-08-21 | Platelet Concentrate | 8 | 2026-08-17 | 2026-08-22 |
| INV-280695-20260822-RDP | 280695 | 2026-08-22 | RDP | 24 | 2026-08-20 | 2026-08-25 |
| INV-280695-20260822-SDP | 280695 | 2026-08-22 | SDP | 5 | 2026-08-21 | 2026-08-26 |

## platelet_demand

| bank_id | date | platelet_requests | platelet_issued | platelet_transfused | platelet_returned | emergency_requests | routine_requests | unfulfilled_requests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 280695 | 2026-08-21 | 13 | 13 | 12 | 1 | 3 | 10 | 0 |
| 280695 | 2026-08-22 | 14 | 14 | 13 | 1 | 3 | 11 | 0 |
| 280695 | 2026-08-23 | 16 | 16 | 14 | 2 | 3 | 13 | 0 |
| 280695 | 2026-08-24 | 11 | 11 | 10 | 1 | 2 | 9 | 0 |
| 280695 | 2026-08-25 | 12 | 12 | 11 | 1 | 3 | 9 | 0 |

## cold_chain

| bank_id | timestamp | temperature | agitation_status | excursion_flag |
| --- | --- | --- | --- | --- |
| 15136 | 2026-08-21T00:00:00 | 21.01 | ON | False |
| 15136 | 2026-08-21T00:01:00 | 21.0 | ON | False |
| 15136 | 2026-08-21T00:02:00 | 21.02 | ON | False |
| 15136 | 2026-08-21T00:03:00 | 21.03 | ON | False |
| 15136 | 2026-08-21T00:04:00 | 21.05 | ON | False |

## equipment

| equipment_id | bank_id | equipment_type | manufacturer | model | timestamp | health_score | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EQ-280695-PIA-01 | 280695 | Platelet incubator with agitator | Remi | RPA-100 | 2026-08-21T00:00:00 | 88.7 | OK |
| EQ-31003-PIA-01 | 31003 | Platelet incubator with agitator | Labtop | LPI-12 | 2026-08-21T00:00:00 | 91.5 | OK |
| EQ-281675-PIA-01 | 281675 | Platelet incubator with agitator | Terumo BCT | Trima Storage Console | 2026-08-21T00:00:00 | 87.4 | OK |
| EQ-281681-PIA-01 | 281681 | Platelet incubator with agitator | Thermo Fisher | Forma 3911 | 2026-08-21T00:00:00 | 85.1 | OK |
| EQ-281691-PIA-01 | 281691 | Platelet incubator with agitator | Helmer | PC2200i | 2026-08-21T00:00:00 | 91.1 | OK |

## transport

| source_bank | destination_bank | distance_km | travel_time_min | vehicle_id | capacity | refrigerated |
| --- | --- | --- | --- | --- | --- | --- |
| 280695 | 31003 | 9.2 | 28 | VH-280695-1 | 60 | True |
| 280695 | 32050 | 1517.12 | 2201 | VH-280695-2 | 48 | True |
| 280695 | 32014 | 1517.12 | 2063 | VH-280695-3 | 24 | True |
| 31003 | 280695 | 9.2 | 32 | VH-31003-1 | 36 | True |
| 31003 | 32050 | 1525.73 | 2568 | VH-31003-2 | 36 | True |

## events

| event_id | bank_id | event_type | timestamp | duration | severity | affected_units | outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-000001 | 31003 | Stockout | 2026-08-28T17:18:00 | 225 | Medium | 1 | Rerouted request to nearest compatible platelet center |
| EV-000002 | 281675 | Stockout | 2026-08-21T10:11:00 | 266 | Medium | 3 | Rerouted request to nearest compatible platelet center |
| EV-000003 | 281675 | Stockout | 2026-09-01T16:01:00 | 99 | High | 6 | Rerouted request to nearest compatible platelet center |
| EV-000004 | 281675 | Stockout | 2026-09-06T12:44:00 | 220 | Medium | 1 | Rerouted request to nearest compatible platelet center |
| EV-000005 | 281675 | Stockout | 2026-09-08T16:24:00 | 164 | Medium | 4 | Rerouted request to nearest compatible platelet center |

## prediction_targets

| bank_id | date | facility_tier | current_stock | expiring_48h | platelet_requests | platelet_issued | unfulfilled_requests | demand_next_24h | demand_next_72h | cold_chain_excursion_minutes | stockout_risk_score | wastage_risk_score | transferable_surplus_units | recommended_action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10001 | 2026-08-21 | metro_tertiary_hub | 211 | 37 | 131 | 131 | 0 | 128 | 363 | 0 | 0.955 | 0.013 | 0 | Request incoming platelet transfer |
| 10001 | 2026-08-22 | metro_tertiary_hub | 230 | 37 | 128 | 128 | 0 | 102 | 356 | 0 | 0.939 | 0.014 | 0 | Request incoming platelet transfer |
| 10001 | 2026-08-23 | metro_tertiary_hub | 208 | 211 | 102 | 102 | 0 | 133 | 388 | 0 | 0.964 | 0.071 | 0 | Request incoming platelet transfer |
| 10001 | 2026-08-24 | metro_tertiary_hub | 215 | 391 | 133 | 133 | 0 | 121 | 361 | 0 | 0.952 | 0.141 | 0 | Request incoming platelet transfer |
| 10001 | 2026-08-25 | metro_tertiary_hub | 230 | 463 | 121 | 121 | 0 | 134 | 353 | 0 | 0.938 | 0.171 | 0 | Request incoming platelet transfer |

## redistribution_recommendations

| date | source_bank | destination_bank | recommended_units | distance_km | travel_time_min | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-08-21 | 2923 | 2924 | 6 | 3.5 | 19 | High | Balance surplus against predicted 72-hour stockout risk |
| 2026-08-21 | 28078 | 98117 | 5 | 2.73 | 20 | High | Balance surplus against predicted 72-hour stockout risk |
| 2026-08-21 | 284471 | 24138 | 5 | 2.92 | 16 | High | Balance surplus against predicted 72-hour stockout risk |
| 2026-08-21 | 283763 | 36146 | 8 | 1.49 | 16 | High | Balance surplus against predicted 72-hour stockout risk |
| 2026-08-21 | 747 | 750 | 5 | 19.48 | 40 | High | Balance surplus against predicted 72-hour stockout risk |

## cold_chain_alerts

| alert_id | bank_id | start_timestamp | end_timestamp | duration_min | max_temperature | agitation_off_minutes | severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AL-000001 | 10131 | 2026-08-21T19:21:00 | 2026-08-21T19:48:00 | 28 | 22.5 | 28 | High |
| AL-000002 | 10131 | 2026-08-22T05:26:00 | 2026-08-22T05:46:00 | 21 | 25.16 | 0 | High |
| AL-000003 | 15004 | 2026-08-22T02:01:00 | 2026-08-22T02:25:00 | 25 | 22.36 | 25 | High |
| AL-000004 | 15007 | 2026-08-21T13:27:00 | 2026-08-21T13:40:00 | 14 | 22.18 | 14 | High |
| AL-000005 | 15007 | 2026-08-22T07:54:00 | 2026-08-22T08:03:00 | 10 | 24.6 | 0 | Medium |

## unit_expiry_risk_features

| unit_id | inventory_id | bank_id | platelet_type | represented_units | collection_timestamp | expiry_timestamp | observation_timestamp | age_hours | remaining_shelf_life_hours | facility_tier | current_stock | expiring_48h | demand_next_24h | demand_next_72h | stockout_risk_score | wastage_risk_score | cumulative_excursion_minutes | max_temperature_exposure | agitation_off_minutes | health_score | status | issue_probability | expiry_risk_probability | degradation_risk_score | shelf_life_loss_hours | effective_remaining_shelf_life_hours | expiry_acceleration_factor | combined_unit_risk_score | risk_band | label_will_expire_unused | label_expiry_accelerated | label_cold_chain_compromised | unit_recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UNIT-280695-20260821-000001 | INV-280695-20260821-RDP | 280695 | RDP | 16 | 2026-08-20 07:00:00 | 2026-08-25 07:00:00 | 2026-08-21 12:00:00 | 29.0 | 91.0 | urban_referral | 28 | 8 | 14 | 41 | 0.916 | 0.031 | 0 | 21.2 | 0 | 88.7 | OK | 0.964 | 0.103 | 0.069 | 1.9 | 89.1 | 1.021 | 0.094 | Low | 0 | 0 | 0 | Likely to be used locally |
| UNIT-280695-20260821-000002 | INV-280695-20260821-SDP | 280695 | SDP | 4 | 2026-08-21 12:00:00 | 2026-08-26 12:00:00 | 2026-08-21 12:00:00 | 0.0 | 120.0 | urban_referral | 28 | 8 | 14 | 41 | 0.916 | 0.031 | 0 | 21.2 | 0 | 88.7 | OK | 0.964 | 0.053 | 0.058 | 0.0 | 120.0 | 1.0 | 0.054 | Low | 0 | 0 | 0 | Likely to be used locally |
| UNIT-280695-20260821-000003 | INV-280695-20260821-PLA | 280695 | Platelet Concentrate | 8 | 2026-08-17 01:00:00 | 2026-08-22 01:00:00 | 2026-08-21 12:00:00 | 107.0 | 13.0 | urban_referral | 28 | 8 | 14 | 41 | 0.916 | 0.031 | 0 | 21.2 | 0 | 88.7 | OK | 0.964 | 0.448 | 0.111 | 7.1 | 5.9 | 1.545 | 0.353 | Medium | 0 | 1 | 0 | Likely to be used locally |
| UNIT-280695-20260822-000004 | INV-280695-20260822-RDP | 280695 | RDP | 24 | 2026-08-20 00:00:00 | 2026-08-25 00:00:00 | 2026-08-22 12:00:00 | 60.0 | 60.0 | urban_referral | 31 | 8 | 16 | 39 | 0.86 | 0.033 | 0 | 21.2 | 0 | 88.7 | OK | 0.944 | 0.253 | 0.084 | 4.0 | 56.0 | 1.066 | 0.206 | Low | 0 | 0 | 0 | Likely to be used locally |
| UNIT-280695-20260822-000005 | INV-280695-20260822-SDP | 280695 | SDP | 5 | 2026-08-21 00:00:00 | 2026-08-26 00:00:00 | 2026-08-22 12:00:00 | 36.0 | 84.0 | urban_referral | 31 | 8 | 16 | 39 | 0.86 | 0.033 | 0 | 21.2 | 0 | 88.7 | OK | 0.944 | 0.157 | 0.072 | 2.4 | 81.6 | 1.028 | 0.133 | Low | 0 | 0 | 0 | Likely to be used locally |
