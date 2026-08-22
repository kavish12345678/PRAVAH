import { useState } from 'react'
import { usePravahData } from './hooks/usePravahData'
import type { PravahStep } from './types'

import { StitchWorkflowNav } from './components/layout/StitchWorkflowNav'
import { StitchTopHeader } from './components/layout/StitchTopHeader'
import { StitchWorkflowRibbon } from './components/layout/StitchWorkflowRibbon'

import { Step0Welcome } from './pages/workflow/Step0Welcome'
import { Step1Overview } from './pages/workflow/Step1Overview'
import { Step2Inventory } from './pages/workflow/Step2Inventory'
import { Step3Forecast } from './pages/workflow/Step3Forecast'
import { Step4Risk } from './pages/workflow/Step4Risk'
import { Step5ColdChain } from './pages/workflow/Step5ColdChain'
import { Step6Pressure } from './pages/workflow/Step6Pressure'
import { Step7Optimize } from './pages/workflow/Step7Optimize'
import { Step8Transfers } from './pages/workflow/Step8Transfers'
import { Step9Approval } from './pages/workflow/Step9Approval'
import { Step10Audit } from './pages/workflow/Step10Audit'
import { StitchModelsPage } from './pages/stitch/StitchModelsPage'

export default function App() {
  const [currentStep, setCurrentStep] = useState<PravahStep>('overview')
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)

  const {
    data,
    loading,
    error,
    scanning,
    lastSynced,
    refresh,
    runIntelligence,
    updateTransferStatus,
  } = usePravahData()

  const handleRunOptimization = async () => {
    try {
      await runIntelligence()
      setCurrentStep('optimize')
    } catch {
      setCurrentStep('optimize')
    }
  }

  const navigateToStep = (step: string) => {
    setCurrentStep(step as PravahStep)
  }

  // 0. WELCOME FLOW
  if (currentStep === 'welcome') {
    return (
      <Step0Welcome
        onEnterPravah={() => setCurrentStep('overview')}
      />
    )
  }

  // 1-10. STEPWISE OPERATIONAL DECISION WORKFLOW
  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-primary-container selection:text-white">
      {/* Numbered Step Navigation Sidebar */}
      <StitchWorkflowNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        onOpenWelcome={() => setCurrentStep('welcome')}
        bloodBankCount={data.summary?.blood_banks ?? 4390}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <StitchTopHeader
          onRefresh={refresh}
          onRunOptimization={handleRunOptimization}
          lastSynced={lastSynced}
          isScanning={scanning}
        />

        {/* Persistent Workflow Progress Ribbon */}
        <StitchWorkflowRibbon
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
        />

        {/* Main Step Canvas or Error / Loading States */}
        <main className="flex-1 flex flex-col pb-16">
          {error && (
            <div className="m-6 p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-error">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
                <div>
                  <p className="font-bold text-sm">PRAVAH Data Service Notice</p>
                  <p className="text-on-surface-variant mt-0.5">{error}</p>
                </div>
              </div>
              <button
                onClick={refresh}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-full cursor-pointer hover:bg-primary-container shrink-0"
              >
                Retry Connection
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
              <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                PRAVAH INTELLIGENCE · Loading operational dataset...
              </p>
            </div>
          ) : (
            <>
              {currentStep === 'overview' && (
                <Step1Overview
                  summary={data.summary}
                  inventory={data.inventory}
                  forecasts={data.forecasts}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'inventory' && (
                <Step2Inventory
                  inventory={data.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'forecast' && (
                <Step3Forecast
                  forecasts={data.forecasts}
                  inventory={data.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'risk' && (
                <Step4Risk
                  risks={data.risks}
                  selectedBank={selectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'cold-chain' && (
                <Step5ColdChain
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'pressure' && (
                <Step6Pressure
                  inventory={data.inventory}
                  forecasts={data.forecasts}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'optimize' && (
                <Step7Optimize
                  transfers={data.transfers}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'transfers' && (
                <Step8Transfers
                  transfers={data.transfers}
                  selectedTransferId={selectedTransferId}
                  onSelectTransfer={setSelectedTransferId}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'approval' && (
                <Step9Approval
                  transfers={data.transfers}
                  selectedTransferId={selectedTransferId}
                  onUpdateStatus={updateTransferStatus}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'audit' && (
                <Step10Audit
                  auditLogs={data.auditLogs}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'models' && (
                <StitchModelsPage
                  metricsData={data.metrics}
                  provenanceData={data.provenance}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
