import { useState } from 'react'
import { usePravahData } from './hooks/usePravahData'
import { useCentreData } from './hooks/useCentreData'
import type { PravahMode, PravahStep } from './types'

// National Layout & Pages
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

// Centre Workspace Layout & Pages
import { CentreLoginScreen } from './pages/centre/CentreLoginScreen'
import { CentreTopHeader } from './components/centre/CentreTopHeader'
import { CentreWorkflowNav } from './components/centre/CentreWorkflowNav'
import { Step1CentreOverview } from './pages/centre/Step1CentreOverview'
import { Step2CentreInventory } from './pages/centre/Step2CentreInventory'
import { Step3CentreForecast } from './pages/centre/Step3CentreForecast'
import { Step4CentreRisk } from './pages/centre/Step4CentreRisk'
import { Step5CentreColdChain } from './pages/centre/Step5CentreColdChain'
import { Step6CentrePressure } from './pages/centre/Step6CentrePressure'
import { Step7CentreOptimize } from './pages/centre/Step7CentreOptimize'
import { Step8CentreTransfers } from './pages/centre/Step8CentreTransfers'
import { Step9CentreApproval } from './pages/centre/Step9CentreApproval'
import { Step10CentreAudit } from './pages/centre/Step10CentreAudit'

export default function App() {
  // Application Mode: 'national' | 'centre' | 'centre-login'
  const [appMode, setAppMode] = useState<PravahMode | 'centre-login'>('national')
  const [currentStep, setCurrentStep] = useState<PravahStep>('overview')
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)

  // 1. National Data State Hook
  const {
    data: nationalData,
    loading: nationalLoading,
    error: nationalError,
    scanning: nationalScanning,
    lastSynced: nationalLastSynced,
    refresh: refreshNational,
    runIntelligence: runNationalIntelligence,
    updateTransferStatus: updateNationalTransferStatus,
  } = usePravahData()

  // 2. Centre Workspace State Hook (Scoped to Chennai Rajiv Gandhi Hospital & 200 km radius)
  const {
    data: centreData,
    loading: centreLoading,
    error: centreError,
    isOptimizing: centreOptimizing,
    lastOptimizedMsg: centreOptimizedMsg,
    lastSynced: centreLastSynced,
    refresh: refreshCentre,
    optimize: optimizeCentre,
    updateTransferStatus: updateCentreTransferStatus,
    filterInventory: filterCentreInventory,
    filterRisks: filterCentreRisks,
  } = useCentreData()

  // Handler for National Optimization
  const handleRunNationalOptimization = async () => {
    try {
      await runNationalIntelligence()
      setCurrentStep('optimize')
    } catch {
      setCurrentStep('optimize')
    }
  }

  // Handler for Centre Optimization
  const handleRunCentreOptimization = async () => {
    try {
      await optimizeCentre()
      setCurrentStep('optimize')
    } catch {
      setCurrentStep('optimize')
    }
  }

  const navigateToStep = (step: string) => {
    setCurrentStep(step as PravahStep)
  }

  // =========================================================================
  // MODE 0: CENTRE LOGIN SCREEN
  // =========================================================================
  if (appMode === 'centre-login') {
    return (
      <CentreLoginScreen
        onLoginSuccess={() => {
          setAppMode('centre')
          setCurrentStep('overview')
        }}
        onSwitchToNational={() => {
          setAppMode('national')
          setCurrentStep('overview')
        }}
      />
    )
  }

  // =========================================================================
  // MODE 1: WELCOME SCREEN (NATIONAL)
  // =========================================================================
  if (currentStep === 'welcome') {
    return (
      <Step0Welcome
        onEnterPravah={() => setCurrentStep('overview')}
      />
    )
  }

  // =========================================================================
  // MODE 2: CENTRE WORKSPACE (CHENNAI RAJIV GANDHI HOSPITAL + 200 KM RADIUS)
  // =========================================================================
  if (appMode === 'centre') {
    return (
      <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-primary-container selection:text-white">
        {/* Centre Step Navigation Sidebar */}
        <CentreWorkflowNav
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          onSwitchToNational={() => {
            setAppMode('national')
            setCurrentStep('overview')
          }}
          facilityCount={centreData.summary?.facilities_in_network ?? centreData.network.length}
        />

        {/* Centre Canvas */}
        <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
          <CentreTopHeader
            onRefresh={refreshCentre}
            onRunOptimization={handleRunCentreOptimization}
            onSwitchMode={() => {
              setAppMode('national')
              setCurrentStep('overview')
            }}
            lastSynced={centreLastSynced}
            isOptimizing={centreOptimizing}
            facilityCount={centreData.summary?.facilities_in_network ?? centreData.network.length}
            hasError={!!centreError}
          />

          {/* Workflow Progress Ribbon */}
          <StitchWorkflowRibbon
            currentStep={currentStep}
            onSelectStep={setCurrentStep}
          />

          {/* Main Centre Step Content */}
          <main className="flex-1 flex flex-col pb-16">
            {centreError && (
              <div className="m-6 p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-error">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">error_outline</span>
                  <div>
                    <p className="font-bold text-sm">Centre Data Service Notice</p>
                    <p className="text-on-surface-variant mt-0.5">{centreError}</p>
                  </div>
                </div>
                <button
                  onClick={refreshCentre}
                  className="px-5 py-2.5 bg-primary text-white font-bold rounded-full cursor-pointer hover:bg-primary-container shrink-0"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {centreLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
                <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  CHENNAI CENTRE WORKSPACE · Loading 200 km regional cohort...
                </p>
              </div>
            ) : (
              <>
                {currentStep === 'overview' && (
                  <Step1CentreOverview
                    summary={centreData.summary}
                    network={centreData.network}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'inventory' && (
                  <Step2CentreInventory
                    inventory={centreData.inventory}
                    onFilter={filterCentreInventory}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'forecast' && (
                  <Step3CentreForecast
                    forecasts={centreData.forecasts}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'risk' && (
                  <Step4CentreRisk
                    risks={centreData.risks}
                    onFilterRisk={filterCentreRisks}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'cold-chain' && (
                  <Step5CentreColdChain
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'pressure' && (
                  <Step6CentrePressure
                    pressure={centreData.pressure}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'optimize' && (
                  <Step7CentreOptimize
                    transfers={centreData.transfers}
                    onRunOptimization={handleRunCentreOptimization}
                    isOptimizing={centreOptimizing}
                    optimizationMessage={centreOptimizedMsg}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'transfers' && (
                  <Step8CentreTransfers
                    transfers={centreData.transfers}
                    onSelectTransfer={setSelectedTransferId}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'approval' && (
                  <Step9CentreApproval
                    transfers={centreData.transfers}
                    selectedTransferId={selectedTransferId}
                    onUpdateStatus={updateCentreTransferStatus}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'audit' && (
                  <Step10CentreAudit
                    auditLogs={centreData.auditLogs}
                    onNavigateToStep={navigateToStep}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    )
  }

  // =========================================================================
  // MODE 3: NATIONAL OVERVIEW (ALL 4,390 FACILITIES)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-primary-container selection:text-white">
      {/* Numbered Step Navigation Sidebar */}
      <StitchWorkflowNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        onOpenWelcome={() => setCurrentStep('welcome')}
        bloodBankCount={nationalData.summary?.blood_banks ?? 4390}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <StitchTopHeader
          onRefresh={refreshNational}
          onRunOptimization={handleRunNationalOptimization}
          onSwitchToCentre={() => setAppMode('centre-login')}
          lastSynced={nationalLastSynced}
          isScanning={nationalScanning}
          hasError={!!nationalError}
        />

        {/* Persistent Workflow Progress Ribbon */}
        <StitchWorkflowRibbon
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
        />

        {/* Main Step Canvas or Error / Loading States */}
        <main className="flex-1 flex flex-col pb-16">
          {nationalError && (
            <div className="m-6 p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-error">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
                <div>
                  <p className="font-bold text-sm">PRAVAH Data Service Notice</p>
                  <p className="text-on-surface-variant mt-0.5">{nationalError}</p>
                </div>
              </div>
              <button
                onClick={refreshNational}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-full cursor-pointer hover:bg-primary-container shrink-0"
              >
                Retry Connection
              </button>
            </div>
          )}

          {nationalLoading ? (
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
                  summary={nationalData.summary}
                  inventory={nationalData.inventory}
                  forecasts={nationalData.forecasts}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'inventory' && (
                <Step2Inventory
                  inventory={nationalData.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'forecast' && (
                <Step3Forecast
                  forecasts={nationalData.forecasts}
                  inventory={nationalData.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={setSelectedBank}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'risk' && (
                <Step4Risk
                  risks={nationalData.risks}
                  riskSummary={nationalData.riskSummary}
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
                  inventory={nationalData.inventory}
                  forecasts={nationalData.forecasts}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'optimize' && (
                <Step7Optimize
                  transfers={nationalData.transfers}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'transfers' && (
                <Step8Transfers
                  transfers={nationalData.transfers}
                  selectedTransferId={selectedTransferId}
                  onSelectTransfer={setSelectedTransferId}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'approval' && (
                <Step9Approval
                  transfers={nationalData.transfers}
                  selectedTransferId={selectedTransferId}
                  onUpdateStatus={updateNationalTransferStatus}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'audit' && (
                <Step10Audit
                  auditLogs={nationalData.auditLogs}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'models' && (
                <StitchModelsPage
                  metricsData={nationalData.metrics}
                  provenanceData={nationalData.provenance}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
