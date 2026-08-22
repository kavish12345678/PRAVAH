/**
 * PRAVAH Client-Side Direct Multilingual Telegram Dispatch Service
 * Compulsory Bot: @Pravah_alert_bot (ID: 8685989654)
 * Token: 8685989654:AAF05st5IsvlGs2yEfMv9FdJCrknxMVkdHo
 */

import type { LanguageCode } from '../i18n/types'

export const TELEGRAM_BOT_TOKEN = '8685989654:AAF05st5IsvlGs2yEfMv9FdJCrknxMVkdHo'
export const TELEGRAM_BOT_USERNAME = 'Pravah_alert_bot'
export const TELEGRAM_BOT_ID = '8685989654'

// Known subscriber chat IDs (e.g. user 'Harsh_ill')
const KNOWN_CHAT_IDS = [1295989935]

export interface TelegramDispatchResult {
  success: boolean
  deliveredCount: number
  totalSubscribers: number
  deliveredChats: { id: number; name?: string; messageId?: number }[]
  errors: string[]
}

export const TELEGRAM_LANGUAGES: Record<
  LanguageCode,
  {
    title: string
    centre: string
    group: string
    units: string
    urgency: string
    radius: string
    appeal: string
    location: string
    contact: string
    btn_donate: string
    btn_directions: string
    btn_call: string
    btn_stop: string
    footer: string
  }
> = {
  en: {
    title: 'PRAVAH EMERGENCY BLOOD DONOR ALERT',
    centre: 'Centre',
    group: 'Required Blood Group',
    units: 'Needed Volume',
    urgency: 'Urgency Level',
    radius: 'Geo-Fence Radius',
    appeal: 'Patient Clinical Appeal',
    location: 'Hospital Location',
    contact: 'Blood Bank Desk',
    btn_donate: '✅ I CAN DONATE',
    btn_directions: '📍 Directions',
    btn_call: '📞 Call Helpdesk',
    btn_stop: '🛑 STOP ALERTS',
    footer: 'Dispatched via @Pravah_alert_bot (Bot ID: 8685989654)',
  },
  hi: {
    title: 'प्रवाह आपातकालीन रक्तदाता अलर्ट',
    centre: 'केंद्र',
    group: 'आवश्यक रक्त समूह',
    units: 'आवश्यक मात्रा',
    urgency: 'तात्कालिकता स्तर',
    radius: 'जियो-फेंस दायरा',
    appeal: 'मरीज क्लिनिकल अपील',
    location: 'अस्पताल का पता',
    contact: 'ब्लड बैंक डेस्क',
    btn_donate: '✅ मैं रक्तदान कर सकता/सकती हूँ',
    btn_directions: '📍 दिशा-निर्देश',
    btn_call: '📞 हेल्पलाइन कॉल करें',
    btn_stop: '🛑 अलर्ट बंद करें',
    footer: '@Pravah_alert_bot द्वारा प्रेषित (बॉट ID: 8685989654)',
  },
  ta: {
    title: 'பிரவாஹ் அவசர இரத்த தான எச்சரிக்கை',
    centre: 'மையம்',
    group: 'தேவைப்படும் இரத்த வகை',
    units: 'தேவைப்படும் அளவு',
    urgency: 'அவசர நிலை',
    radius: 'சேவை பரப்பளவு',
    appeal: 'மருத்துவக் கோரிக்கை',
    location: 'மருத்துவமனை இடம்',
    contact: 'இரத்த வங்கி உதவி மையம்',
    btn_donate: '✅ நான் இரத்த தானம் செய்ய முடியும்',
    btn_directions: '📍 வழிகாட்டுதல்',
    btn_call: '📞 உதவி மையத்தை அழைக்கவும்',
    btn_stop: '🛑 அறிவிப்புகளை நிறுத்தவும்',
    footer: '@Pravah_alert_bot வழியாக அனுப்பப்பட்டது (பாட் ID: 8685989654)',
  },
  te: {
    title: 'ప్రవాహ్ అత్యవసర రక్తదాత హెచ్చరిక',
    centre: 'కేంద్రం',
    group: 'అవసరమైన రక్త గ్రూప్',
    units: 'అవసరమైన పరిమాణం',
    urgency: 'అత్యవసర స్థాయి',
    radius: 'సేవా పరిధి',
    appeal: 'క్లినికల్ అభ్యర్థన',
    location: 'ఆసుపత్రి స్థానం',
    contact: 'బ్లడ్ బ్యాంక్ హెల్ప్‌డెస్క్',
    btn_donate: '✅ నేను రక్తదానం చేయగలను',
    btn_directions: '📍 దిశలు',
    btn_call: '📞 హెల్ప్‌డెస్క్‌కు కాల్ చేయండి',
    btn_stop: '🛑 హెచ్చరికలను ఆపండి',
    footer: '@Pravah_alert_bot ద్వారా పంపబడింది (బాట్ ID: 8685989654)',
  },
  bn: {
    title: 'প্রবাহ জরুরি রক্তদান অ্যালার্ট',
    centre: 'কেন্দ্র',
    group: 'প্রয়োজনীয় রক্তের গ্রুপ',
    units: 'প্রয়োজনীয় পরিমাণ',
    urgency: 'জরুরিতার মাত্রা',
    radius: 'পরিষেবা এলাকা',
    appeal: 'ক্লিনিকাল আবেদন',
    location: 'হাসপাতালের ঠিকানা',
    contact: 'ব্লাড ব্যাংক হেল্পডেস্ক',
    btn_donate: '✅ আমি রক্তদান করতে পারি',
    btn_directions: '📍 দিকনির্দেশ',
    btn_call: '📞 হেল্পডেস্কে কল করুন',
    btn_stop: '🛑 অ্যালার্ট বন্ধ করুন',
    footer: '@Pravah_alert_bot দ্বারা প্রেরিত (বট ID: 8685989654)',
  },
  mr: {
    title: 'प्रवाह आपत्कालीन रक्तदाता अलर्ट',
    centre: 'केंद्र',
    group: 'आवश्यक रक्त गट',
    units: 'आवश्यक प्रमाण',
    urgency: 'तातडीची पातळी',
    radius: 'सेवा परिसर',
    appeal: 'क्लिनिकल आवाहन',
    location: 'रुग्णालय पत्ता',
    contact: 'ब्लड बँक हेल्पडेस्क',
    btn_donate: '✅ मी रक्तदान करू शकतो/शकते',
    btn_directions: '📍 दिशा-निर्देश',
    btn_call: '📞 हेल्पडेस्कला कॉल करा',
    btn_stop: '🛑 अलर्ट बंद करा',
    footer: '@Pravah_alert_bot द्वारे पाठवले (बॉट ID: 8685989654)',
  },
}

/**
 * Discovers active Telegram chat IDs that have interacted with the bot.
 */
export async function getLiveTelegramSubscribers(): Promise<number[]> {
  const chatIds = new Set<number>(KNOWN_CHAT_IDS)

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
      method: 'GET',
    })

    if (res.ok) {
      const data = await res.json()
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          const msg = update.message || update.channel_post || update.callback_query?.message
          const chat = msg?.chat
          if (chat?.id) {
            chatIds.add(Number(chat.id))
          }
        }
      }
    }
  } catch (err) {
    console.warn('[PRAVAH Telegram] getUpdates fetch notice:', err)
  }

  return Array.from(chatIds)
}

/**
 * Dispatches an emergency blood donor alert formatted in HTML to all active Telegram subscribers in preferred language.
 */
export async function sendEmergencyTelegramBroadcast(params: {
  centreName: string
  centreId: string
  bloodGroup: string
  unitsNeeded: number
  urgency: string
  radiusKm: number
  customNote?: string
  hospitalContact: string
  language?: LanguageCode
}): Promise<TelegramDispatchResult> {
  const subscribers = await getLiveTelegramSubscribers()
  const langKey = params.language || 'en'
  const loc = TELEGRAM_LANGUAGES[langKey] || TELEGRAM_LANGUAGES.en

  const urgencyEmoji = params.urgency === 'CRITICAL' ? '🚨' : params.urgency === 'URGENT' ? '⚠️' : '📢'

  const htmlMessage = `${urgencyEmoji} <b>${loc.title}</b> ${urgencyEmoji}

🏥 <b>${loc.centre}</b>: ${params.centreName} (<code>${params.centreId}</code>)
🩸 <b>${loc.group}</b>: <b>${params.bloodGroup}</b>
📦 <b>${loc.units}</b>: <b>${params.unitsNeeded} Units</b>
⚡ <b>${loc.urgency}</b>: <b>${params.urgency}</b>
📍 <b>${loc.radius}</b>: Within ${params.radiusKm} km of Park Town, Chennai

<b>${loc.appeal}</b>:
<i>${params.customNote || 'Emergency blood support required for acute clinical stabilization.'}</i>

📍 <b>${loc.location}</b>: Rajiv Gandhi Govt General Hospital, EVR Periyar Salai, Park Town, Chennai 600003
📞 <b>${loc.contact}</b>: <code>${params.hospitalContact}</code>

━━━━━━━━━━━━━━━━━━━━
🤖 <i>${loc.footer}</i>`

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: loc.btn_donate,
          url: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=donate_chn`,
        },
        {
          text: loc.btn_stop,
          url: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=stop`,
        },
      ],
      [
        {
          text: loc.btn_directions,
          url: 'https://maps.google.com/?q=13.081279,80.276780',
        },
        {
          text: loc.btn_call,
          url: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
        },
      ],
    ],
  }

  const deliveredChats: { id: number; name?: string; messageId?: number }[] = []
  const errors: string[] = []

  for (const chatId of subscribers) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlMessage,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      })

      const json = await response.json()
      if (json.ok) {
        deliveredChats.push({
          id: chatId,
          name: json.result?.chat?.first_name || json.result?.chat?.username || String(chatId),
          messageId: json.result?.message_id,
        })
      } else {
        errors.push(`Chat ${chatId}: ${json.description || 'Failed to send'}`)
      }
    } catch (sendErr) {
      errors.push(`Chat ${chatId}: ${sendErr instanceof Error ? sendErr.message : 'Network error'}`)
    }
  }

  return {
    success: deliveredChats.length > 0,
    deliveredCount: deliveredChats.length,
    totalSubscribers: subscribers.length,
    deliveredChats,
    errors,
  }
}
