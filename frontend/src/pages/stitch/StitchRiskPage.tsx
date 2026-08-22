import type { FeatureImportanceItem, RiskItem } from '../../types'

interface StitchRiskPageProps {
  risks: RiskItem[]
  featureImportance?: FeatureImportanceItem[]
}

const DEFAULT_IMPORTANCES: FeatureImportanceItem[] = [
  { feature: 'wastage_risk_score', importance_mean: 0.1473, importance_std: 0.0016 },
  { feature: 'issue_probability', importance_mean: 0.1361, importance_std: 0.0009 },
  { feature: 'age_hours', importance_mean: 0.0571, importance_std: 0.0005 },
  { feature: 'remaining_shelf_life_hours', importance_mean: 0.0275, importance_std: 0.0003 },
  { feature: 'tier_code', importance_mean: 0.0236, importance_std: 0.0001 },
  { feature: 'stockout_risk_score', importance_mean: 0.0040, importance_std: 0.00006 },
]

export function StitchRiskPage({ risks, featureImportance }: StitchRiskPageProps) {
  const featList = featureImportance && featureImportance.length > 0 ? featureImportance : DEFAULT_IMPORTANCES

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12 select-none">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-on-surface">
          Risk Intelligence &amp; Expiry Modeling
        </h2>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          HistGradientBoosting Expiry Risk Model (Binary ROC-AUC: 0.9999, Precision: 99.65%) evaluating unit-level spoilage and stockout hazards.
        </p>
      </header>

      {/* Upper Section: Risk Distribution */}
      <section className="bg-f5f1ee rounded-2xl p-8 md:p-10 border border-outline-variant/15 space-y-8 shadow-xs">
        <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          Operational Dataset Risk Distribution
        </h3>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-end px-1 font-sans">
            <div>
              <span className="font-sans text-3xl sm:text-4xl font-bold text-secondary">62%</span>
              <span className="text-xs text-on-surface-variant block mt-1 font-semibold">Stable Batches</span>
            </div>
            <div className="text-center">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-tertiary-fixed-dim">21%</span>
              <span className="text-xs text-on-surface-variant block mt-1 font-semibold">Monitoring</span>
            </div>
            <div className="text-center">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-primary-fixed-dim text-primary">12%</span>
              <span className="text-xs text-on-surface-variant block mt-1 font-semibold">High Risk</span>
            </div>
            <div className="text-right">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-primary-container">5%</span>
              <span className="text-xs text-primary-container block mt-1 font-bold">Imminent Expiry</span>
            </div>
          </div>

          <div className="h-4 flex rounded-full overflow-hidden w-full bg-surface-variant">
            <div className="bg-secondary h-full" style={{ width: '62%' }} title="Stable 62%" />
            <div className="bg-[#ffb95a] h-full" style={{ width: '21%' }} title="Monitoring 21%" />
            <div className="bg-[#ffb3b4] h-full" style={{ width: '12%' }} title="High Risk 12%" />
            <div className="bg-primary-container h-full" style={{ width: '5%' }} title="Critical 5%" />
          </div>
        </div>
      </section>

      {/* Asymmetric Grid (Affected Locations + Contributing Factors) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Middle Section: Critical Affected Units (7 cols) */}
        <section className="lg:col-span-7 bg-f5f1ee rounded-2xl p-8 md:p-10 border border-outline-variant/15 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                High Risk Predictions
              </h3>
              <span className="text-xs text-primary font-bold font-sans">
                {risks.length} Scored Batches
              </span>
            </div>

            <div className="divide-y divide-outline-variant/15 font-sans">
              {risks.slice(0, 5).map((r) => {
                let factors: string[] = []
                if (Array.isArray(r.contributing_features)) {
                  factors = r.contributing_features
                } else if (typeof r.contributing_features === 'string') {
                  try {
                    factors = JSON.parse(r.contributing_features)
                  } catch {
                    factors = [r.contributing_features]
                  }
                }

                return (
                  <div
                    key={r.id}
                    className="py-4 flex items-center justify-between group hover:bg-surface-variant/30 px-3 -mx-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          r.risk_level === 'HIGH' ? 'bg-primary-container' : 'bg-secondary'
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">
                          Batch #{r.inventory_id} · Score: {r.risk_score.toFixed(3)}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {factors.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        r.risk_level === 'HIGH'
                          ? 'bg-error-container text-error'
                          : 'bg-secondary-container text-secondary'
                      }`}
                    >
                      {r.risk_level}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Lower Section: AI Decision Logic (5 cols) */}
        <section className="lg:col-span-5 bg-f5f1ee rounded-2xl p-8 md:p-10 border border-outline-variant/15 space-y-6">
          <div>
            <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
              GBDT Feature Importance
            </span>
            <h4 className="font-serif text-2xl font-semibold text-on-surface">
              Contributing Factors
            </h4>
          </div>

          <p className="font-sans text-xs text-on-surface-variant leading-relaxed hairline-l pl-4">
            Feature weights computed by <strong className="text-on-surface font-bold">HistGradientBoostingRegressor</strong> trained on national inventory features.
          </p>

          <div className="space-y-4 font-sans text-xs">
            {featList.slice(0, 5).map((f) => {
              const val = f.importance_mean ?? f.importance ?? 0
              const pct = (val * 100).toFixed(1)
              return (
                <div key={f.feature} className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-on-surface capitalize">
                      {f.feature.replace(/_/g, ' ')}
                    </span>
                    <span className="text-primary-container font-bold">{pct}% Impact</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, val * 400))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
