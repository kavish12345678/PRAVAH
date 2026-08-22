import { useState } from 'react'
import { CentreTopHeader } from './components/centre/CentreTopHeader'
import { CentreWorkflowNav } from './components/centre/CentreWorkflowNav'
import { DonorMobilisationModal } from './components/centre/DonorMobilisationModal'
import { FullScreenFlash, triggerFlash } from './components/effects/FullScreenFlash'
import { PageTransition } from './components/effects/PageTransition'
import { StitchTopHeader } from './components/layout/StitchTopHeader'
import { StitchWorkflowNav } from './components/layout/StitchWorkflowNav'
import { StitchWorkflowRibbon } from './components/layout/StitchWorkflowRibbon'
import { LanguageSelectModal } from './components/common/LanguageSelectModal'
import { useCentreData } from './hooks/useCentreData'
import { usePravahData } from './hooks/usePravahData'
import { CentreLoginScreen } from './pages/centre/CentreLoginScreen'
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
import { StitchModelsPage } from './pages/stitch/StitchModelsPage'
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
import type { MultiStopConsolidationCandidate, PravahMode, PravahStep } from './types'

export function App() {
  // Operating Mode: 'national' (General National Dashboard) vs 'centre' (Chennai RGH + 200km Network) vs 'centre-login'
  const [appMode, setAppMode] = useState<PravahMode | 'centre-login'>('centre')
  const [currentStep, setCurrentStep] = useState<PravahStep>('overview')
  const [previousStep, setPreviousStep] = useState<PravahStep | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)
  const [selectedConsolidationCandidate, setSelectedConsolidationCandidate] = useState<MultiStopConsolidationCandidate | null>(null)
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false)

  // National Dataset Hook
  const {
    data: nationalData,
    loading: nationalLoading,
    error: nationalError,
    lastSynced: nationalLastSynced,
    isScanning,
    refresh: refreshNational,
    runOptimization: runNationalOptimization,
    updateTransferStatus: updateNationalTransferStatus,
  } = usePravahData()

  // Centre Workspace Hook (Chennai RGH 282724 Anchor + 200km Radius)
  const {
    data: centreData,
    loading: centreLoading,
    error: centreError,
    lastSynced: centreLastSynced,
    isOptimizing: centreOptimizing,
    lastOptimizedMsg: centreOptimizedMsg,
    refresh: refreshCentre,
    optimize: optimizeCentre,
    updateTransferStatus: updateCentreTransferStatus,
    filterInventory: filterCentreInventory,
    filterRisks: filterCentreRisks,
  } = useCentreData(282724)

  // Handler for National Optimization
  const handleRunNationalOptimization = async () => {
    try {
      await runNationalOptimization()
      handleStepTransition('optimize')
    } catch {
      handleStepTransition('optimize')
    }
  }

  // Handler for Centre Optimization
  const handleRunCentreOptimization = async () => {
    try {
      await optimizeCentre()
      handleStepTransition('optimize')
    } catch {
      handleStepTransition('optimize')
    }
  }

  const handleStepTransition = (step: string | PravahStep) => {
    triggerFlash()
    setPreviousStep(currentStep)
    setCurrentStep(step as PravahStep)
  }

  const navigateToStep = (step: string) => {
    handleStepTransition(step)
  }

  // =========================================================================
  // MODE 0: CENTRE LOGIN SCREEN
  // =========================================================================
  if (appMode === 'centre-login') {
    return (
      <CentreLoginScreen
        onLoginSuccess={() => {
          setAppMode('centre')
          handleStepTransition('overview')
        }}
        onSwitchToNational={() => {
          setAppMode('national')
          handleStepTransition('overview')
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
        onEnterPravah={() => handleStepTransition('overview')}
      />
    )
  }

  // =========================================================================
  // MODE 2: CENTRE WORKSPACE (CHENNAI RAJIV GANDHI HOSPITAL + 200 KM RADIUS)
  // =========================================================================
  if (appMode === 'centre') {
    return (
      <div className="min-h-screen bg-[#FAF7F5] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-[#FCECEE] selection:text-[#7A1C28]">
        {/* Centre Step Navigation Sidebar */}
        <CentreWorkflowNav
          currentStep={currentStep}
          onSelectStep={handleStepTransition}
          onSwitchToNational={() => {
            setAppMode('national')
            handleStepTransition('overview')
          }}
          onOpenDonorMobilisation={() => setIsDonorModalOpen(true)}
          facilityCount={centreData.summary?.facilities_in_network ?? centreData.network.length}
        />

        {/* Centre Canvas */}
        <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
          <CentreTopHeader
            onRefresh={refreshCentre}
            onRunOptimization={handleRunCentreOptimization}
            onSwitchMode={() => {
              setAppMode('national')
              handleStepTransition('overview')
            }}
            lastSynced={centreLastSynced}
            isOptimizing={centreOptimizing}
            facilityCount={centreData.summary?.facilities_in_network ?? centreData.network.length}
            hasError={!!centreError}
          />

          {/* Workflow Progress Ribbon */}
          <StitchWorkflowRibbon
            currentStep={currentStep}
            onSelectStep={handleStepTransition}
          />

          {/* Main Centre Step Content */}
          <main className="flex-1 flex flex-col pb-16">
            {centreError && (
              <div className="m-6 p-6 bg-[#FCECEE] border border-[#F5D5D9] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A1C28]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">error_outline</span>
                  <div>
                    <p className="font-bold text-sm">Centre Data Service Notice</p>
                    <p className="text-[#5A5451] mt-0.5">{centreError}</p>
                  </div>
                </div>
                <button
                  onClick={refreshCentre}
                  className="px-5 py-2.5 bg-[#7A1C28] text-white font-bold rounded-full cursor-pointer hover:bg-[#63141F] shrink-0"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {centreLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
                <span className="w-8 h-8 rounded-full border-2 border-[#7A1C28] border-t-transparent animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#7A7471]">
                  CHENNAI CENTRE WORKSPACE · Loading 200 km regional cohort...
                </p>
              </div>
            ) : (
              <PageTransition key={currentStep}>
                {currentStep === 'overview' && (
                  <Step1CentreOverview
                    summary={centreData.summary}
                    coldChain={centreData.coldChain}
                    health={centreData.health}
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
                    coldChain={centreData.coldChain}
                    isFromExpiryRisk={previousStep === 'risk'}
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
                    onSelectConsolidationCandidate={setSelectedConsolidationCandidate}
                    onNavigateToStep={navigateToStep}
                  />
                )}

                {currentStep === 'approval' && (
                  <Step9CentreApproval
                    transfers={centreData.transfers}
                    selectedTransferId={selectedTransferId}
                    selectedConsolidationCandidate={selectedConsolidationCandidate}
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
              </PageTransition>
            )}
          </main>
        </div>

        {/* Emergency Donor Mobilisation Modal */}
        <DonorMobilisationModal
          isOpen={isDonorModalOpen}
          onClose={() => setIsDonorModalOpen(false)}
        />

        {/* Full-Screen Soft Light-Red Flash Transition */}
        <FullScreenFlash />
      </div>
    )
  }

  // =========================================================================
  // MODE 3: NATIONAL OVERVIEW (ALL 4,390 BLOOD BANKS)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-[#FCECEE] selection:text-[#7A1C28]">
      {/* Step Navigation Sidebar */}
      <StitchWorkflowNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        onOpenWelcome={() => setCurrentStep('welcome')}
        bloodBankCount={nationalData.summary?.blood_banks ?? 4390}
      />

      {/* Main Canvas */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <StitchTopHeader
          onRefresh={refreshNational}
          onRunOptimization={handleRunNationalOptimization}
          onSwitchToCentre={() => {
            setAppMode('centre')
            setCurrentStep('overview')
          }}
          lastSynced={nationalLastSynced}
          isScanning={isScanning}
          hasError={!!nationalError}
        />

        {/* Workflow Progress Ribbon */}
        <StitchWorkflowRibbon
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
        />

        {/* Main Step Content */}
        <main className="flex-1 flex flex-col pb-16">
          {nationalError && (
            <div className="m-6 p-6 bg-[#FCECEE] border border-[#F5D5D9] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A1C28]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
                <div>
                  <p className="font-bold text-sm">PRAVAH Data Service Notice</p>
                  <p className="text-[#5A5451] mt-0.5">{nationalError}</p>
                </div>
              </div>
              <button
                onClick={refreshNational}
                className="px-5 py-2.5 bg-[#7A1C28] text-white font-bold rounded-full cursor-pointer hover:bg-[#63141F] shrink-0"
              >
                Retry Connection
              </button>
            </div>
          )}

          {nationalLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
              <span className="w-8 h-8 rounded-full border-2 border-[#7A1C28] border-t-transparent animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A7471]">
                Loading PRAVAH Operational Dataset...
              </p>
            </div>
          ) : (
            <>
              {currentStep === 'overview' && (
                <Step1Overview
                  summary={nationalData.summary}
                  nationalSummary={nationalData.nationalSummary}
                  inventory={nationalData.inventory}
                  forecasts={nationalData.forecasts}
                  selectedBank={selectedBank}
                  onSelectBank={(bank) => setSelectedBank(bank)}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'inventory' && (
                <Step2Inventory
                  inventory={nationalData.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={(bank) => setSelectedBank(bank)}
                  onNavigateToStep={navigateToStep}
                />
              )}

              {currentStep === 'forecast' && (
                <Step3Forecast
                  forecasts={nationalData.forecasts}
                  inventory={nationalData.inventory}
                  selectedBank={selectedBank}
                  onSelectBank={(bank) => setSelectedBank(bank)}
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

      {/* Full-Screen Soft Light-Red Flash Transition */}
      <FullScreenFlash />

      {/* First-Visit Multilingual Selection Modal */}
      <LanguageSelectModal />
    </div>
  )
}

export default App
