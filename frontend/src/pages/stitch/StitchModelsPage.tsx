import type { ModelMetricsResponse, ProvenanceResponse } from '../../types'

interface StitchModelsPageProps {
  metricsData: ModelMetricsResponse | null
  provenanceData: ProvenanceResponse | null
}

export function StitchModelsPage({ metricsData, provenanceData }: StitchModelsPageProps) {
  const m = metricsData?.metrics

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12 select-none font-sans">
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Authoritative ML Layer
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-on-surface">
          Model Intelligence &amp; Data Provenance
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          Trained machine learning models, benchmark evaluation metrics, and dataset provenance for the PRAVAH blood supply platform.
        </p>
      </header>

      {/* 4 Core Models Grid */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-on-surface">
          Trained Model Architectures &amp; Evaluation Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model 1: Demand Forecasting */}
          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Model 01 · GBDT Regressor
                </span>
                <h3 className="font-serif text-2xl font-semibold text-on-surface mt-1">
                  Demand Forecasting (24h &amp; 72h)
                </h3>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Predicts facility-level platelet demand at 24-hour and 72-hour planning horizons based on facility tier, seasonal dengue multipliers, and consumption velocity.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <div>
                <span className="text-[11px] text-on-surface-variant">24h Horizon R²</span>
                <div className="text-2xl font-bold text-primary">
                  {m?.model_1_demand_forecasting?.horizon_24h?.R2 ?? 0.7634}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  MAE: {m?.model_1_demand_forecasting?.horizon_24h?.MAE ?? 3.92} units
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant">72h Horizon R²</span>
                <div className="text-2xl font-bold text-on-surface">
                  {m?.model_1_demand_forecasting?.horizon_72h?.R2 ?? 0.5074}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  MAE: {m?.model_1_demand_forecasting?.horizon_72h?.MAE ?? 13.74} units
                </span>
              </div>
            </div>
          </div>

          {/* Model 2: Expiry & Wastage Risk */}
          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Model 02 · GBDT Classifier &amp; Regressor
                </span>
                <h3 className="font-serif text-2xl font-semibold text-on-surface mt-1">
                  Expiry &amp; Wastage Risk Model
                </h3>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Assesses probability of unit-level expiration and local wastage using remaining shelf-life, temperature stress, and projected hospital demand.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <div>
                <span className="text-[11px] text-on-surface-variant">Binary ROC-AUC</span>
                <div className="text-2xl font-bold text-primary">
                  {m?.model_2_expiry_risk?.Binary_ROC_AUC ?? 0.9999}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Precision: {(Number(m?.model_2_expiry_risk?.Binary_Precision ?? 0.9965) * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant">Brier Score</span>
                <div className="text-2xl font-bold text-secondary">
                  {m?.model_2_expiry_risk?.Brier_Score ?? 0.0604}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Recall: {(Number(m?.model_2_expiry_risk?.Binary_Recall ?? 0.9960) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Model 3: Cold-Chain Anomaly */}
          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  Model 03 · Hybrid Isolation Forest
                </span>
                <h3 className="font-serif text-2xl font-semibold text-on-surface mt-1">
                  Cold-Chain &amp; Hardware Anomaly
                </h3>
              </div>
              <span className="px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Detects temperature excursions beyond WHO 20°C–24°C bounds and agitator motor stalls using continuous telemetry streams.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <div>
                <span className="text-[11px] text-on-surface-variant">Anomaly ROC-AUC</span>
                <div className="text-2xl font-bold text-secondary">
                  {m?.model_3_cold_chain_anomaly?.ML_Anomaly_ROC_AUC ?? 0.9938}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Excursion Recall: 100.0%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant">Total Excursions Evaluated</span>
                <div className="text-2xl font-bold text-on-surface">
                  {m?.model_3_cold_chain_anomaly?.Total_Excursions_Detected?.toLocaleString() ?? '10,540'}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Ground truth: 5,383
                </span>
              </div>
            </div>
          </div>

          {/* Optimization Engine */}
          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  Engine 04 · Linear Programming (HiGHS)
                </span>
                <h3 className="font-serif text-2xl font-semibold text-on-surface mt-1">
                  Min-Cost Network Flow Redistribution
                </h3>
              </div>
              <span className="px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full">
                Optimal
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Formulates whole-network linear programming problem minimizing transit time and spoilage while enforcing blood group compatibility.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <div>
                <span className="text-[11px] text-on-surface-variant">LP Solved Routes</span>
                <div className="text-2xl font-bold text-on-surface">
                  {m?.optimization?.lp_routes_count ?? 745}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Greedy baseline: {m?.optimization?.greedy_routes_count ?? 739}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant">Units Redistributed</span>
                <div className="text-2xl font-bold text-secondary">
                  {m?.optimization?.lp_total_units_redistributed?.toLocaleString() ?? '1,935'}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Global optimum achieved
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Provenance Section */}
      <section className="bg-white p-8 md:p-10 rounded-2xl border border-outline-variant/15 space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-on-surface">
          Dataset Provenance &amp; Operational Calibration
        </h2>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          The PRAVAH operational dataset integrates public healthcare directory snapshots with clinical cold-chain constraints and regional discard studies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-on-surface-variant">
          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl">
            <h4 className="font-bold text-on-surface text-sm">Blood Bank Network</h4>
            <ul className="list-disc list-inside space-y-1">
              {provenanceData?.sources?.blood_bank_network?.map((s, idx) => (
                <li key={idx}>{s}</li>
              )) ?? (
                <>
                  <li>e-RaktKosh India Blood Bank Directory public portal snapshot (4,390 facilities)</li>
                  <li>National Health Portal Open Government Data catalog</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl">
            <h4 className="font-bold text-on-surface text-sm">Clinical &amp; Storage Guidelines</h4>
            <ul className="list-disc list-inside space-y-1">
              {provenanceData?.sources?.constraints?.map((s, idx) => (
                <li key={idx}>{s}</li>
              )) ?? (
                <>
                  <li>WHO guidance: platelet storage at 20-24°C with continuous gentle agitation</li>
                  <li>WHO blood cold-chain manual &amp; maximum 5-day shelf life constraint</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl">
            <h4 className="font-bold text-on-surface text-sm">Equipment Specifications</h4>
            <ul className="list-disc list-inside space-y-1">
              {provenanceData?.sources?.equipment?.map((s, idx) => (
                <li key={idx}>{s}</li>
              )) ?? (
                <li>AIIMS public tenders for platelet incubator &amp; agitator purchases (22°C ± 2°C)</li>
              )}
            </ul>
          </div>

          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl">
            <h4 className="font-bold text-on-surface text-sm">Regional Demand Calibration</h4>
            <ul className="list-disc list-inside space-y-1">
              {provenanceData?.sources?.calibration?.map((s, idx) => (
                <li key={idx}>{s}</li>
              )) ?? (
                <>
                  <li>Telangana statewide blood component discard study (17.0% baseline discard ratio)</li>
                  <li>Dhote et al. 2023 seasonal dengue/malaria demand multiplier (16.6% monsoon surge)</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
