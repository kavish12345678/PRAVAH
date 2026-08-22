import type { AuditItem } from '../../types'

interface Step10AuditProps {
  auditLogs: AuditItem[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step10Audit({ auditLogs, onNavigateToStep }: Step10AuditProps) {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 10 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Permanent Audit Ledger
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What happened?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Immutable audit record of all clinical transfer authorizations, rejections, and corridor dispatches.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('overview')}
          className="bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Return to Flow</span>
          <span className="material-symbols-outlined text-[18px]">replay</span>
        </button>
      </header>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="hairline-b text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider bg-surface-container-low">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Authorized User</th>
              <th className="py-3.5 px-4">Corridor (Source ➔ Recipient)</th>
              <th className="py-3.5 px-4 text-right">Quantity</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {auditLogs.map((log) => {
              const isApproved = log.approval_status === 'APPROVED' || log.action.includes('APPROVED')

              return (
                <tr key={log.id} className="hover:bg-f5f1ee transition-colors">
                  <td className="py-3.5 px-4 text-on-surface-variant font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{log.user}</td>
                  <td className="py-3.5 px-4 text-on-surface">
                    <span className="font-semibold">{log.source_bank}</span>
                    <span className="text-on-surface-variant mx-1.5">➔</span>
                    <span className="text-primary font-semibold">{log.destination_bank}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-on-surface">
                    {log.quantity ? `${log.quantity} u` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-secondary-container text-secondary'
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      {log.approval_status || 'RECORDED'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Completion Summary Card */}
      <div className="p-8 bg-f5f1ee rounded-2xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Workflow Complete
            </span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-on-surface">
            Clinical Decision Cycle Resolved
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xl">
            From initial network observation through demand forecasting, risk evaluation, and LP optimization to human authorization and permanent audit.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigateToStep('models')}
            className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-full text-xs font-bold uppercase hover:text-primary transition-colors cursor-pointer"
          >
            Inside PRAVAH (Models)
          </button>
          <button
            onClick={() => onNavigateToStep('overview')}
            className="bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
          >
            Restart Journey
          </button>
        </div>
      </div>
    </div>
  )
}
