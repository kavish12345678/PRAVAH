export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr'

export interface LanguageMeta {
  code: LanguageCode
  name: string
  nativeName: string
  badge: string
  script: string
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', badge: 'EN', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', badge: 'हि', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', badge: 'த', script: 'Tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', badge: 'తె', script: 'Telugu' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', badge: 'বা', script: 'Bengali' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', badge: 'म', script: 'Devanagari' },
]

export interface TranslationSchema {
  common: {
    appTitle: string
    appSubtitle: string
    tagline: string
    searchPlaceholder: string
    syncing: string
    synced: string
    facilitiesConnected: string
    serviceRadius: string
    liveStatus: string
    active: string
    loading: string
    error: string
    retry: string
    cancel: string
    confirm: string
    continue: string
    save: string
    close: string
    back: string
    apply: string
    refresh: string
    export: string
    status: string
    viewAll: string
    showing: string
    of: string
    prev: string
    next: string
    units: string
    unitSingle: string
    km: string
    hours: string
    mins: string
    critical: string
    urgent: string
    moderate: string
    healthy: string
    surplus: string
    deficit: string
    standard: string
    all: string
    primaryHub: string
    ready: string
    selectLanguage: string
    chooseLanguageTitle: string
    chooseLanguageSubtitle: string
    changeLanguage: string
    currentLanguage: string
  }
  navigation: {
    flow: string
    inventory: string
    forecast: string
    risk: string
    coldChain: string
    pressure: string
    optimize: string
    transfers: string
    approval: string
    audit: string
    centreOverview: string
    localInventory: string
    demandForecast: string
    expiryRisk: string
    regionalPressure: string
    routeOptimizationModel: string
    redistribution: string
    authorization: string
    auditTrail: string
    nationalMode: string
    centreWorkspace: string
    switchToNational: string
    switchToCentre: string
    donorMobilisation: string
    donorMobilisationSub: string
  }
  centre: {
    overviewTitle: string
    overviewSubtitle: string
    solve200km: string
    runOptimization: string
    modelSolved: string
    activeUnits: string
    deficitFacilities: string
    surplusFacilities: string
    coldChainAlerts: string
    radiusService: string
    networkFacilities: string
    anchorCentre: string
    quickStats: string
  }
  national: {
    overviewTitle: string
    overviewSubtitle: string
    totalInventory: string
    lowStockBatches: string
    nearExpiry: string
    highRiskUnits: string
    activeTransfers: string
    activeProjectFacilities: string
    operationalBalances: string
    allIndia: string
    north: string
    south: string
    east: string
    west: string
    central: string
    filterByState: string
    searchBloodBanks: string
    viewDeficits: string
    viewRisk: string
    exploreInventory: string
    nationalCohort: string
  }
  inventory: {
    title: string
    subtitle: string
    bloodGroup: string
    totalUnits: string
    batches: string
    expiryStatus: string
    storageTemp: string
    donorType: string
    compatibility: string
    inventoryBreakdown: string
    criticalDeficit: string
    healthyStock: string
    stockLevel: string
    nearExpiryWarning: string
  }
  forecast: {
    title: string
    subtitle: string
    forecastHorizon: string
    forecast24h: string
    forecast72h: string
    currentStock: string
    projectedDemand: string
    projectedShortage: string
    gbdtModelAccuracy: string
    confidenceInterval: string
    seasonalTrend: string
    surgeRisk: string
    modelMetrics: string
  }
  risk: {
    title: string
    subtitle: string
    expiryRiskAssessment: string
    mlScoring: string
    highRiskBatches: string
    remainingShelfLife: string
    spoilageProbability: string
    isolationForestScore: string
    gbdtRiskGrade: string
    clinicalActionRequired: string
    riskFactors: string
  }
  coldChain: {
    title: string
    subtitle: string
    storageIntegrity: string
    currentTemp: string
    whoBounds: string
    thermalAlerts: string
    mechanicalAgitation: string
    incubatorHealth: string
    activeExcursions: string
    telemetryStream: string
    sensorTelemetry: string
    allLogs: string
    excursionsOnly: string
    agitatorsOnly: string
  }
  pressure: {
    title: string
    subtitle: string
    regionalPressureIndex: string
    netDeficit: string
    netSurplus: string
    corridorPressure: string
    interHubStrain: string
    evacuationPriority: string
  }
  optimization: {
    title: string
    subtitle: string
    simplexLinearProgramming: string
    minCostFlow: string
    transitTime: string
    distanceKm: string
    coldChainFeasibility: string
    clinicalPriorityScore: string
    reRunSolver: string
    optimalDispatchRoutes: string
    recommendedRoute: string
  }
  multiStop: {
    title: string
    subtitle: string
    multiStopConsolidation: string
    directPlan: string
    consolidatedPlan: string
    savingsDistance: string
    savingsDuration: string
    fewerTrips: string
    modelWinner: string
    intermediateStops: string
    recommendedPlan: string
    authorizeConsolidation: string
    comparison: string
  }
  transfers: {
    title: string
    subtitle: string
    transferCorridors: string
    originHub: string
    destinationHospital: string
    authorizedUnits: string
    dispatchVehicle: string
    carrierStatus: string
    inTransit: string
    delivered: string
    auditLogged: string
  }
  approval: {
    title: string
    subtitle: string
    officerSignOff: string
    clinicalAuthorization: string
    biometricPin: string
    authorizeTransfer: string
    rejectTransfer: string
    verifiedByOfficer: string
    permanentLedger: string
    authorizedSuccess: string
  }
  audit: {
    title: string
    subtitle: string
    verifiableAuditLedger: string
    hashSignature: string
    timestamp: string
    eventLog: string
    decisionRationale: string
    immutableRecord: string
    compliancePassed: string
  }
  donorMobilisation: {
    modalTitle: string
    modalSubtitle: string
    specialFeature: string
    targetBloodGroup: string
    urgencyLevel: string
    geoFenceRadius: string
    donorsInReach: string
    unitsNeeded: string
    clinicalAppeal: string
    hospitalDeskPhone: string
    dispatchBroadcast: string
    dispatching: string
    deliveredSuccess: string
    recipientsReached: string
    telegramDelivery: string
    premadeTemplatesTitle: string
    oneClickFill: string
    botConnected: string
    customAppealPlaceholder: string
    nearbyDonors: string
    botLivePreview: string
  }
  telegram: {
    alertHeader: string
    centreLabel: string
    requiredGroupLabel: string
    volumeNeededLabel: string
    urgencyLabel: string
    geoFenceLabel: string
    appealLabel: string
    locationLabel: string
    contactLabel: string
    buttonDonate: string
    buttonDirections: string
    buttonCall: string
    buttonStop: string
    dispatchedVia: string
  }
  modelExplanations: {
    gbdtForecast: string
    isolationForest: string
    highsLp: string
    riskScore: string
    coldChainIntegrity: string
  }
  tooltips: {
    riskScore: string
    wastageScore: string
    routePriorityScore: string
    coldChainFeasibility: string
    highsSolver: string
  }
  errors: {
    dataUnavailable: string
    loadFailed: string
    routeCalcFailed: string
    networkError: string
    telegramError: string
    noDonorsFound: string
    unauthorized: string
    genericError: string
  }
  success: {
    routeCalculated: string
    alertDispatched: string
    statusUpdated: string
    transferAuthorized: string
    settingsSaved: string
    languageChanged: string
  }
}
