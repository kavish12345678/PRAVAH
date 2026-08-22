import { useState } from 'react'

interface Recommendation {
  id: string
  title: string
  description: string
  riskLevel: 'Low' | 'Medium' | 'High'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-01',
    title: 'Transfer 15 Units of O-Negative from Northside to City Hospital',
    description:
      'Based on predicted demand surge in the next 4 hours and current inventory surplus at the origin facility. The predictive model indicates an 85% probability of shortage at City Hospital within this window due to multiple incoming trauma alerts.',
    riskLevel: 'Low',
    status: 'PENDING',
  },
  {
    id: 'REC-02',
    title: 'Escalate Bengaluru Trauma Center Platelet Inventory Buffer',
    description:
      'Continuous historical trend matching detects a 40% higher weekend demand spike in central Bengaluru due to seasonal caseload surges.',
    riskLevel: 'High',
    status: 'PENDING',
  },
  {
    id: 'REC-03',
    title: 'Quarantine Batch #PL-9921 for Thermal Inspection',
    description:
      'Chamber sensor logged a 24.8°C spike for 18 minutes during regional transit. Quarantine protocol recommended before clinical issue.',
    riskLevel: 'Medium',
    status: 'PENDING',
  },
]

export function StitchHumanReviewPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS)

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full space-y-12 select-none">
      {/* Page Header */}
      <header className="space-y-2">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary">
          Human Review
        </h2>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          Review and authorize pending intelligence-driven recommendations before operational execution.
        </p>
      </header>

      {/* Recommendations List */}
      <div className="space-y-12">
        {recommendations.map((rec) => {
          const isPending = rec.status === 'PENDING'

          return (
            <article
              key={rec.id}
              className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-primary/20 space-y-4"
            >
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-2">
                  {rec.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                  {rec.description}
                </p>
              </div>

              {/* Risk Level Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    rec.riskLevel === 'High'
                      ? 'bg-primary-container'
                      : rec.riskLevel === 'Medium'
                      ? 'bg-tertiary-fixed-dim'
                      : 'bg-secondary'
                  }`}
                />
                <span
                  className={`font-sans text-xs font-bold uppercase tracking-wider ${
                    rec.riskLevel === 'High'
                      ? 'text-primary'
                      : rec.riskLevel === 'Medium'
                      ? 'text-tertiary'
                      : 'text-secondary'
                  }`}
                >
                  Risk Level: {rec.riskLevel}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                {isPending ? (
                  <>
                    <button
                      onClick={() => handleAction(rec.id, 'APPROVED')}
                      className="bg-primary-container text-white font-sans text-xs font-bold uppercase px-8 py-3 rounded-md hover:bg-primary transition-colors cursor-pointer shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => alert(`Modifying parameters for ${rec.id}...`)}
                      className="bg-transparent text-primary font-sans text-xs font-bold uppercase px-8 py-3 rounded-md border border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => handleAction(rec.id, 'REJECTED')}
                      className="text-on-surface-variant hover:text-primary font-sans text-xs font-medium px-4 py-3 transition-colors underline underline-offset-4 cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-4 py-2 rounded-md font-sans text-xs font-bold uppercase ${
                      rec.status === 'APPROVED'
                        ? 'bg-secondary-container text-secondary'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    Action Recorded: {rec.status}
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
