import { useState } from 'react'

interface CentreLoginScreenProps {
  onLoginSuccess: () => void
  onSwitchToNational: () => void
}

export function CentreLoginScreen({
  onLoginSuccess,
  onSwitchToNational,
}: CentreLoginScreenProps) {
  const [centreCode, setCentreCode] = useState('CHN-RGH-001')
  const [password, setPassword] = useState('pravah2026')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    try {
      // Simulate auth delay for realistic presentation UX
      await new Promise((r) => setTimeout(r, 400))
      onLoginSuccess()
    } catch {
      setErrorMsg('Invalid Centre ID or password. Please use demo credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] flex flex-col justify-between selection:bg-primary-container selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="px-6 md:px-12 h-20 flex justify-between items-center border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-on-surface">PRAVAH</h1>
            <p className="text-[10px] text-on-surface-variant">Clinical Decision Flow</p>
          </div>
        </div>

        <button
          onClick={onSwitchToNational}
          className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>National Overview</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-outline-variant/20 shadow-lg space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Centre Workspace Access
            </span>
            <h2 className="font-serif text-3xl font-bold text-on-surface">
              Centre Login
            </h2>
            <p className="text-xs text-on-surface-variant">
              Authenticate to access centre-scoped operations and 200 km network intelligence.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl text-xs font-semibold text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-bold text-on-surface uppercase tracking-wider text-[10px]">
                Centre Facility ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={centreCode}
                  onChange={(e) => setCentreCode(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-mono text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="CHN-RGH-001"
                  required
                />
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Facility: <strong className="text-on-surface font-semibold">Government Rajiv Gandhi Medical College Hospital (Chennai)</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-on-surface uppercase tracking-wider text-[10px]">
                Access Key / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-mono text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary hover:bg-primary-container text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLoading ? 'sync' : 'lock_open'}
              </span>
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Centre Workspace'}</span>
            </button>
          </form>

          {/* Quick Demo Info */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Demo Operational Context</span>
            </div>
            <ul className="text-[11px] text-on-surface-variant space-y-1">
              <li>• Anchor: <strong className="text-on-surface">Chennai Rajiv Gandhi Hospital</strong></li>
              <li>• Operational Service Radius: <strong className="text-primary font-bold">200 km</strong></li>
              <li>• Active Network: <strong className="text-on-surface">149 Real Facilities in Radius</strong></li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 text-center text-[11px] text-on-surface-variant border-t border-outline-variant/10">
        PRAVAH Blood Supply Intelligence · Centre Operations Engine
      </footer>
    </div>
  )
}
