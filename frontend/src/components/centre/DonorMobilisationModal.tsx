import { useEffect, useState } from 'react'
import { dispatchDonorBroadcast, fetchDonorMobilisationConfig } from '../../services/api'
import {
  sendEmergencyTelegramBroadcast,
  TELEGRAM_BOT_ID,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_LANGUAGES,
} from '../../services/telegramService'
import type { DonorMobilisationConfig, PremadeTemplate } from '../../types'
import { useLanguage } from '../../i18n/LanguageContext'

interface DonorMobilisationModalProps {
  isOpen: boolean
  onClose: () => void
}

const BLOOD_GROUP_OPTIONS = [
  { value: 'O- Negative', label: 'O- Negative (Critical Deficit / Universal)', deficit: true },
  { value: 'Platelet Concentrate', label: 'Platelet Concentrate (PC - 5 Day Shelf Life)', deficit: true },
  { value: 'A+ Positive', label: 'A+ Positive (High Local Demand)', deficit: false },
  { value: 'AB+ Positive', label: 'AB+ Positive (Emergency Plasma)', deficit: false },
  { value: 'B+ Positive', label: 'B+ Positive (General Reserve)', deficit: false },
  { value: 'All Eligible Blood Groups', label: 'All Eligible Blood Groups (Mass Mobilisation)', deficit: false },
]

const RADIUS_OPTIONS = [
  { value: 5.0, label: '5 km · Immediate Park Town', donors: 16 },
  { value: 10.0, label: '10 km · Central & North Chennai', donors: 32 },
  { value: 15.0, label: '15 km · Recommended (Full Network)', donors: 48 },
  { value: 25.0, label: '25 km · Greater Chennai Metro', donors: 76 },
]

const DEFAULT_TEMPLATES: PremadeTemplate[] = [
  {
    id: 'trauma_icu',
    title: '🚨 Emergency Trauma & ICU Surge',
    badge: 'CRITICAL',
    text: 'Emergency mass-casualty and trauma resuscitation in progress at Park Town ICU. Immediate whole blood and platelet support needed.',
  },
  {
    id: 'pediatric_oncology',
    title: '🩸 Pediatric Oncology & Thalassemia',
    badge: 'URGENT',
    text: 'Urgent scheduled transfusion needed for pediatric oncology and thalassemia ward. Platelet concentrates and washed RBCs required within 4 hours.',
  },
  {
    id: 'platelet_stockout',
    title: '⚠️ Platelet Deficit (<24h Stock)',
    badge: 'URGENT',
    text: 'Critical platelet concentrate deficit detected across Chennai sector. Voluntary SDP (Single Donor Platelet) apheresis donors requested today.',
  },
  {
    id: 'code_red_reserve',
    title: '🏥 Code Red Blood Reserve Alert',
    badge: 'CRITICAL',
    text: 'Code Red Blood Reserve activation. Low inventory warning across North Chennai network. Voluntary walk-in donors urgently requested at Chennai RGH Blood Centre.',
  },
  {
    id: 'bypass_surgery',
    title: '🕒 Off-Hours Cardiac Surgery Need',
    badge: 'URGENT',
    text: 'Immediate cross-matched units required for ongoing emergency cardiovascular surgery. On-call donors within 15 km requested to report.',
  },
]

interface DeliverySummary {
  success: boolean
  recipientsReached: number
  telegramDeliveredCount: number
  telegramChats: { id: number; name?: string; messageId?: number }[]
  timestamp: string
  bloodGroup: string
  unitsNeeded: number
  telegramStatus: 'DELIVERED' | 'SIMULATED' | 'ERROR'
  telegramErrors?: string[]
}

export function DonorMobilisationModal({ isOpen, onClose }: DonorMobilisationModalProps) {
  const { language, t } = useLanguage()
  const [config, setConfig] = useState<DonorMobilisationConfig | null>(null)
  const [bloodGroup, setBloodGroup] = useState<string>('O- Negative')
  const [urgency, setUrgency] = useState<string>('CRITICAL')
  const [radiusKm, setRadiusKm] = useState<number>(15.0)
  const [unitsNeeded, setUnitsNeeded] = useState<number>(10)
  const [customNote, setCustomNote] = useState<string>(DEFAULT_TEMPLATES[0].text)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id)
  const [hospitalContact, setHospitalContact] = useState<string>('+91 44 2530 5000')

  const [isSending, setIsSending] = useState<boolean>(false)
  const [deliverySummary, setDeliverySummary] = useState<DeliverySummary | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchDonorMobilisationConfig()
        .then((cfg) => {
          setConfig(cfg)
        })
        .catch(() => {})
    } else {
      setDeliverySummary(null)
      setErrorMsg(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const templates = config?.premade_templates || DEFAULT_TEMPLATES
  const selectedRadiusOption = RADIUS_OPTIONS.find((r) => r.value === radiusKm) || RADIUS_OPTIONS[2]
  const nearbyDonorsCount = selectedRadiusOption.donors

  const handleSelectTemplate = (tpl: PremadeTemplate) => {
    setSelectedTemplateId(tpl.id)
    setCustomNote(tpl.text)
    setUrgency(tpl.badge)
  }

  const handleSendBroadcast = async () => {
    setIsSending(true)
    setErrorMsg(null)

    try {
      // 1. Direct real-time Telegram dispatch to bot subscribers in preferred language
      const tgResult = await sendEmergencyTelegramBroadcast({
        centreName: 'Government Rajiv Gandhi Medical College Hospital (Chennai RGH)',
        centreId: 'CHN-RGH-001',
        bloodGroup,
        unitsNeeded,
        urgency,
        radiusKm,
        customNote,
        hospitalContact,
        language,
      })

      // 2. Also record in backend API
      try {
        await dispatchDonorBroadcast({
          centre_id: 'CHN-RGH-001',
          centre_name: 'Government Rajiv Gandhi Medical College Hospital (Chennai RGH)',
          blood_group: bloodGroup,
          units_needed: unitsNeeded,
          urgency,
          radius_km: radiusKm,
          hospital_contact: hospitalContact,
          custom_note: customNote,
          template_id: selectedTemplateId,
        })
      } catch (backendErr) {
        console.warn('[PRAVAH] Backend audit dispatch note:', backendErr)
      }

      const isDelivered = tgResult.deliveredCount > 0

      setDeliverySummary({
        success: isDelivered || tgResult.errors.length === 0,
        recipientsReached: nearbyDonorsCount,
        telegramDeliveredCount: tgResult.deliveredCount,
        telegramChats: tgResult.deliveredChats,
        timestamp: new Date().toLocaleString(),
        bloodGroup,
        unitsNeeded,
        telegramStatus: isDelivered ? 'DELIVERED' : (tgResult.errors.length > 0 ? 'ERROR' : 'SIMULATED'),
        telegramErrors: tgResult.errors,
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('errors.telegramError'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs select-none font-sans animate-fade-in">
      <div className="bg-[#FAF7F5] border border-[#E8E1DC] rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto flex flex-col">
        {/* Modal Top Header */}
        <div className="p-6 md:px-8 border-b border-[#E8E1DC] bg-white rounded-t-3xl flex justify-between items-start gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FCECEE] text-[#7A1C28] border border-[#F5D5D9] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px] animate-pulse">
                volunteer_activism
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                  {t('donorMobilisation.specialFeature')}
                </span>
                <span className="px-2.5 py-0.5 bg-[#E0F2FE] text-[#0369A1] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-ping" />
                  @{TELEGRAM_BOT_USERNAME} ({TELEGRAM_BOT_ID})
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1F1B19] mt-1">
                {t('donorMobilisation.modalTitle')}
              </h2>
              <p className="text-xs text-[#7A7471]">
                {t('donorMobilisation.modalSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF7F5] hover:bg-[#F2ECE8] text-[#7A7471] hover:text-[#1F1B19] flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* If broadcast already sent: show confirmation banner */}
          {deliverySummary && (
            <div
              className={`p-5 rounded-2xl space-y-3 animate-fade-in border ${
                deliverySummary.telegramStatus === 'DELIVERED'
                  ? 'bg-[#DCFCE7] border-[#BBF7D0]'
                  : 'bg-[#FEF3C7] border-[#FDE68A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 font-bold text-sm ${
                    deliverySummary.telegramStatus === 'DELIVERED' ? 'text-[#166534]' : 'text-[#92400E]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {deliverySummary.telegramStatus === 'DELIVERED' ? 'check_circle' : 'info'}
                  </span>
                  <span>
                    {deliverySummary.telegramStatus === 'DELIVERED'
                      ? 'Emergency Broadcast Delivered to Telegram!'
                      : 'Emergency Broadcast Processed'}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    deliverySummary.telegramStatus === 'DELIVERED' ? 'text-[#166534]' : 'text-[#92400E]'
                  }`}
                >
                  {deliverySummary.timestamp}
                </span>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  deliverySummary.telegramStatus === 'DELIVERED' ? 'text-[#166534]' : 'text-[#92400E]'
                }`}
              >
                Emergency broadcast dispatched to {deliverySummary.recipientsReached} nearby donors in Chennai service radius.
                {deliverySummary.telegramDeliveredCount > 0 && (
                  <span>
                    {' '}Delivered to <b>{deliverySummary.telegramDeliveredCount}</b> active user chats on <b>@{TELEGRAM_BOT_USERNAME}</b>
                    {deliverySummary.telegramChats.map((c) => ` [${c.name || c.id}]`).join(', ')}.
                  </span>
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                <div className="bg-white/80 p-2.5 rounded-xl">
                  <span className="text-[#5A5451] text-[10px] uppercase block">Recipients Reached</span>
                  <strong className="text-sm text-[#1F1B19]">{deliverySummary.recipientsReached} Donors</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl">
                  <span className="text-[#5A5451] text-[10px] uppercase block">Target Blood Group</span>
                  <strong className="text-sm text-[#1F1B19]">{deliverySummary.bloodGroup}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl">
                  <span className="text-[#5A5451] text-[10px] uppercase block">Required Volume</span>
                  <strong className="text-sm text-[#1F1B19]">{deliverySummary.unitsNeeded} Units</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl">
                  <span className="text-[#5A5451] text-[10px] uppercase block">Telegram Status</span>
                  <strong
                    className={`text-sm uppercase font-bold ${
                      deliverySummary.telegramStatus === 'DELIVERED' ? 'text-[#16A34A]' : 'text-[#D97706]'
                    }`}
                  >
                    {deliverySummary.telegramStatus === 'DELIVERED'
                      ? `DELIVERED (${deliverySummary.telegramDeliveredCount} CHATS)`
                      : deliverySummary.telegramStatus}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-[#FCECEE] border border-[#F5D5D9] rounded-2xl text-xs text-[#7A1C28] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2-Column Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Broadcast Parameters & Premade Templates (7 cols) */}
            <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-[#1F1B19]">
                  Mobilisation Parameters
                </h3>
                <span className="text-[10px] font-mono text-[#0369A1] font-bold bg-[#E0F2FE] px-2.5 py-1 rounded-full">
                  BOT: @{TELEGRAM_BOT_USERNAME}
                </span>
              </div>

              {/* Premade Custom Message Templates Picker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                    Choose Premade Message Template
                  </label>
                  <span className="text-[10px] text-[#7A1C28] font-bold font-mono">
                    1-Click Fast Fill
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                        selectedTemplateId === tpl.id
                          ? 'bg-[#FCECEE] border-[#F5D5D9] text-[#7A1C28] font-bold shadow-2xs'
                          : 'bg-[#FAF7F5] border-[#E8E1DC] text-[#5A5451] hover:bg-[#F2ECE8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">{tpl.title}</span>
                        <span
                          className={`text-[8.5px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            tpl.badge === 'CRITICAL'
                              ? 'bg-[#7A1C28] text-white'
                              : 'bg-[#D97706] text-white'
                          }`}
                        >
                          {tpl.badge}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-[#7A7471] line-clamp-2 mt-1 font-normal">
                        {tpl.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Target Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                  {t('donorMobilisation.targetBloodGroup')}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1F1B19] focus:outline-hidden focus:border-[#7A1C28] cursor-pointer"
                >
                  {BLOOD_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Urgency Level & Units Needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                    {t('donorMobilisation.urgencyLevel')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['CRITICAL', 'URGENT', 'STANDARD'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`py-2 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer ${
                          urgency === lvl
                            ? lvl === 'CRITICAL'
                              ? 'bg-[#7A1C28] text-white shadow-xs'
                              : lvl === 'URGENT'
                              ? 'bg-[#D97706] text-white shadow-xs'
                              : 'bg-[#4B5563] text-white shadow-xs'
                            : 'bg-[#FAF7F5] text-[#5A5451] border border-[#E8E1DC] hover:bg-[#F2ECE8]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                    {t('donorMobilisation.unitsNeeded')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnitsNeeded(u)}
                        className={`py-2 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer ${
                          unitsNeeded === u
                            ? 'bg-[#7A1C28] text-white shadow-xs'
                            : 'bg-[#FAF7F5] text-[#5A5451] border border-[#E8E1DC] hover:bg-[#F2ECE8]'
                        }`}
                      >
                        {t('common.units', { count: u })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Geo-Fence Broadcast Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#7A7471] uppercase tracking-wider">
                    {t('donorMobilisation.geoFenceRadius')}
                  </label>
                  <span className="font-mono text-[#7A1C28] font-bold">
                    {t('donorMobilisation.donorsInReach', { count: nearbyDonorsCount })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRadiusKm(r.value)}
                      className={`p-3 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                        radiusKm === r.value
                          ? 'bg-[#FCECEE] border-[#F5D5D9] text-[#7A1C28] font-bold'
                          : 'bg-[#FAF7F5] border-[#E8E1DC] text-[#5A5451] hover:bg-[#F2ECE8]'
                      }`}
                    >
                      <span className="block font-mono text-[11px]">{r.label}</span>
                      <span className="text-[10px] text-[#7A7471] block font-normal mt-0.5">
                        ~{r.donors} active registered bot users
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Clinical Note & Helpdesk Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                    {t('donorMobilisation.clinicalAppeal')}
                  </label>
                  <textarea
                    value={customNote}
                    onChange={(e) => {
                      setCustomNote(e.target.value)
                      setSelectedTemplateId('custom')
                    }}
                    rows={2}
                    className="w-full bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl p-3 text-xs text-[#1F1B19] focus:outline-hidden focus:border-[#7A1C28] resize-none"
                    placeholder={t('donorMobilisation.customAppealPlaceholder')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#7A7471] uppercase tracking-wider block">
                    {t('donorMobilisation.hospitalDeskPhone')}
                  </label>
                  <input
                    type="text"
                    value={hospitalContact}
                    onChange={(e) => setHospitalContact(e.target.value)}
                    className="w-full bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl px-3 py-2.5 text-xs text-[#1F1B19] font-mono focus:outline-hidden focus:border-[#7A1C28]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Telegram Mockup & Nearby Donors (5 cols) */}
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
              {/* Telegram Phone Mockup */}
              <div className="bg-[#242F3D] text-white p-5 rounded-3xl shadow-md space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0088CC] flex items-center justify-center text-white text-xs font-bold">
                      ✈
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-none">@{TELEGRAM_BOT_USERNAME}</h4>
                      <span className="text-[9.5px] text-white/60">Donor mobilization · official bot</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4ADE80] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    {t('donorMobilisation.botConnected')}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className="bg-[#17212B] p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed space-y-2 border border-white/5">
                  <div className="flex items-center gap-1.5 text-[#FF6B6B] font-bold text-[11px]">
                    <span>🚨</span>
                    <span>{TELEGRAM_LANGUAGES[language]?.title || TELEGRAM_LANGUAGES.en.title}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-white/90">
                    <p>🏥 <b>{TELEGRAM_LANGUAGES[language]?.centre || 'Centre'}</b>: Chennai RGH (CHN-RGH-001)</p>
                    <p>🩸 <b>{TELEGRAM_LANGUAGES[language]?.group || 'Required Group'}</b>: <span className="text-[#FFD166] font-bold">{bloodGroup}</span></p>
                    <p>📦 <b>{TELEGRAM_LANGUAGES[language]?.units || 'Needed'}</b>: {t('common.units', { count: unitsNeeded })}</p>
                    <p>⚡ <b>{TELEGRAM_LANGUAGES[language]?.urgency || 'Urgency'}</b>: {urgency} (<span className="text-[#06D6A0]">{t('common.km', { distance: radiusKm })}</span>)</p>
                  </div>

                  <p className="text-[10.5px] text-white/70 italic border-l-2 border-[#FF6B6B] pl-2 my-1">
                    "{customNote}"
                  </p>

                  <p className="text-[10px] text-white/50">
                    📍 Park Town, Chennai · 📞 {hospitalContact}
                  </p>
                </div>

                {/* Interactive Telegram Inline Buttons */}
                <div className="space-y-1.5 pt-1">
                  <div className="w-full py-2 bg-[#2B5278] hover:bg-[#346290] text-center text-xs font-bold text-white rounded-xl cursor-pointer">
                    {TELEGRAM_LANGUAGES[language]?.btn_donate || '✅ I CAN DONATE'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="py-1.5 bg-[#1E2C3A] text-center text-[10.5px] text-white/80 rounded-lg">
                      {TELEGRAM_LANGUAGES[language]?.btn_directions || '📍 Directions'}
                    </div>
                    <div className="py-1.5 bg-[#1E2C3A] text-center text-[10.5px] text-white/80 rounded-lg">
                      {TELEGRAM_LANGUAGES[language]?.btn_call || '📞 Call Helpdesk'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Nearby Donors Roster */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider font-mono">
                    {t('donorMobilisation.nearbyDonors')}
                  </h4>
                  <span className="text-[10px] text-[#16A34A] font-bold font-mono">
                    {t('donorMobilisation.donorsInReach', { count: nearbyDonorsCount })}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(config?.sample_nearby_donors || []).slice(0, 4).map((d) => (
                    <div key={d.id} className="p-2 bg-[#FAF7F5] rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#1F1B19] block">{d.name}</span>
                        <span className="text-[10px] text-[#7A7471]">{d.area} · {d.distance_km} km away</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-[#FCECEE] text-[#7A1C28] font-bold font-mono rounded text-[10px] block">
                          {d.blood_group}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-6 md:px-8 bg-white border-t border-[#E8E1DC] rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-[#7A7471]">
            <span>Sending via compulsory bot <b>@{TELEGRAM_BOT_USERNAME}</b> to donors within <b>{radiusKm} km</b>.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-[#E8E1DC] text-xs font-bold text-[#5A5451] hover:bg-[#FAF7F5] transition-all cursor-pointer"
            >
              {t('common.cancel')}
            </button>

            <button
              onClick={handleSendBroadcast}
              disabled={isSending}
              className="px-7 py-3.5 bg-gradient-to-r from-[#7A1C28] to-[#9E2A38] hover:from-[#63141F] hover:to-[#7A1C28] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{t('donorMobilisation.dispatching')}</span>
                </>
              ) : (
                <>
                  <span>{t('donorMobilisation.dispatchBroadcast')}</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
