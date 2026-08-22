import type { AuditItem } from '../../types'

interface Step10CentreAuditProps {
  auditLogs: AuditItem[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step10CentreAudit({
  auditLogs,
  onNavigateToStep,
}: Step10CentreAuditProps) {
  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 10 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Immutable Operations Audit Trail
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            Centre Operations Audit Ledger
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Chronological compliance record of model inferences, optimizer executions, and human officer dispatch authorizations within the <strong className="text-on-surface font-semibold">200 km Chennai network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('overview')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Return to Centre Overview</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Audit Log Table */}
      <section className="bg-white rounded-3xl border border-outline-variant/15 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h2 className="font-serif text-xl font-bold text-on-surface">
              Recorded Clinical Actions ({auditLogs.length} Entries)
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Permanent Database Compliance Ledger</p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">SQLite WAL Immutable Record</span>
        </div>

        <div className="divide-y divide-outline-variant/10 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      log.approval_status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.approval_status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {log.action}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface truncate">
                  {log.source_bank} &rarr; {log.destination_bank}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Authorizing Officer: <strong className="text-on-surface font-semibold">{log.user}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-bold text-primary font-mono block">
                  {log.quantity ? `${log.quantity} Units` : 'System Action'}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Ref #{log.recommendation_id ?? log.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
