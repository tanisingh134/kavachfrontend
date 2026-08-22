/**
 * AudioSynthesis - Browser Web Audio API sound synthesis and speech deterrent engine.
 * Generates panic sirens, haptic audio cues, fake call ringtones, and localized speech warnings across 15+ languages.
 */

import { translations, SUPPORTED_LANGUAGES } from './translations';

let audioCtx = null;
let sirenOscillator1 = null;
let sirenGain = null;
let ringtoneInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * High-decibel dual-oscillator acoustic emergency siren
 */
export function startPanicSiren() {
  try {
    const ctx = getAudioContext();
    if (sirenGain) stopPanicSiren();

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.3, ctx.currentTime);
    sirenGain.connect(ctx.destination);

    // Oscillator 1 - sweeping tone
    sirenOscillator1 = ctx.createOscillator();
    sirenOscillator1.type = 'sawtooth';
    sirenOscillator1.frequency.setValueAtTime(750, ctx.currentTime);

    // LFO to modulate siren pitch
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2.5, ctx.currentTime); // 2.5 cycles per sec

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(350, ctx.currentTime); // frequency delta

    lfo.connect(lfoGain);
    lfoGain.connect(sirenOscillator1.frequency);

    sirenOscillator1.connect(sirenGain);
    lfo.start();
    sirenOscillator1.start();
    return true;
  } catch (e) {
    console.warn('Web Audio Siren error:', e);
    return false;
  }
}

export function stopPanicSiren() {
  try {
    if (sirenOscillator1) {
      sirenOscillator1.stop();
      sirenOscillator1.disconnect();
      sirenOscillator1 = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
  } catch (e) {
    console.warn('Error stopping siren:', e);
  }
}

/**
 * Subtle stealth haptic audio beep for Tier 1 guidance
 */
export function playHapticTone(type = 'subtle') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = type === 'warning' ? 520 : type === 'alert' ? 660 : type === 'success' ? 440 : 380;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    // Trigger mobile vibration API if available
    if (navigator.vibrate) {
      navigator.vibrate(type === 'warning' ? [100, 50, 100] : [70]);
    }
  } catch (e) {
    console.warn('Haptic tone error:', e);
  }
}

/**
 * Phone Ringtone simulation for Tier 2 Incoming Fake Call
 */
export function startFakeCallRingtone() {
  try {
    const ctx = getAudioContext();
    stopFakeCallRingtone();

    const playChime = () => {
      const notes = [440, 480, 520, 660];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    };

    playChime();
    ringtoneInterval = setInterval(playChime, 2400);
  } catch (e) {
    console.warn('Ringtone error:', e);
  }
}

export function stopFakeCallRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

/**
 * Map language codes to BCP-47 speech synth locale tags
 */
const SPEECH_LANG_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  ar: 'ar-SA'
};

/**
 * Synthesizes deterrent voice over speaker when fake call is picked up
 */
export function speakDeterrentVoice(text = null, language = 'en') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const defaultPhrases = {
      en: "Hey! I'm waiting for you right outside at the corner with Officer Sharma. Where are you?",
      hi: "अरे! मैं बाहर कोने पर ऑफिसर शर्मा के साथ तुम्हारी प्रतीक्षा कर रहा हूँ। तुम कहाँ पहुँचे?",
      bn: "আরে! আমি বাইরে অফিসার শর্মার সাথে তোমার জন্য অপেক্ষা করছি। তুমি কোথায়?",
      ta: "ஹேய்! நான் வெளியே அதிகாரி சர்மாவுடன் காத்திருக்கிறேன். நீங்கள் எங்கே இருக்கிறீர்கள்?",
      te: "హే! నేను బయట ఆఫీసర్ శర్మతో కలిసి మీ కోసం వేచి ఉన్నాను. మీరు ఎక్కడ ఉన్నారు?",
      mr: "अरे! मी बाहेर कोपऱ्यावर ऑफिसर शर्मांसोबत तुझी वाट पाहत आहे. तू कुठे आहेस?",
      gu: "અરે! હું બહાર ખૂણા પર ઓફિસર શર્મા સાથે તમારી રાહ જોઈ રહ્યો છું. તમે ક્યાં પહોંચ્યા?",
      kn: "ಹೇ! ನಾನು ಹೊರಗಡೆ ಅಧಿಕಾರಿ ಶರ್ಮಾ ಅವರೊಂದಿಗೆ ನಿಮಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇನೆ. ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?",
      ml: "ഹേയ്! ഞാൻ പുറത്ത് ഓഫീസർ ശർമ്മയോടൊപ്പം നിങ്ങൾക്കായി കാത്തിരിക്കുന്നു. നിങ്ങൾ എവിടെയാണ്?",
      pa: "ਹੇ! ਮੈਂ ਬਾਹਰ ਕੋਨੇ 'ਤੇ ਅਧਿਕਾਰੀ ਸ਼ਰਮਾ ਨਾਲ ਤੁਹਾਡੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹਾਂ। ਤੁਸੀਂ ਕਿੱਥੇ ਹੋ?",
      es: "¡Hola! Te estoy esperando afuera en la esquina con el oficial Sharma. ¿Dónde estás?",
      fr: "Salut ! Je t'attends dehors au coin avec l'officier Sharma. Où es-tu ?",
      de: "Hallo! Ich warte draußen an der Ecke mit Officer Sharma auf dich. Wo bist du?",
      ja: "もしもし！シャルマ警官と一緒に角の外で待っていますよ。今どこですか？",
      ar: "مرحباً! أنا في انتظارك في الخارج عند الزاوية مع الضابط شارما. أين أنت؟"
    };

    const phrase = text || defaultPhrases[language] || defaultPhrases.en;
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(language) || v.lang.includes(language));
    if (matchedVoice) utterance.voice = matchedVoice;

    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeechDeterrent() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Pre-Entry Danger Alert: Dual-tone warning chime + AI Voice Warning in 15+ Languages
 */
export function playPreEntryWarningAudio(customText = null, onComplete = null, language = 'en') {
  try {
    const ctx = getAudioContext();

    // 1. Play Pre-Entry Dual-Tone Warning Chime
    const playPing = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Ping 1 (high alert 880Hz) -> Ping 2 (low caution 587Hz)
    playPing(880, 0, 0.18);
    playPing(587, 0.2, 0.25);

    if (navigator.vibrate) {
      navigator.vibrate([150, 80, 150]);
    }

    // 2. Synthesize AI Spoken Warning after chime
    setTimeout(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const langData = translations[language] || translations.en;
        const textToSpeak = customText || langData.preEntryVoiceText || translations.en.preEntryVoiceText;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;
        utterance.lang = SPEECH_LANG_MAP[language] || 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang.startsWith(language) || v.lang.includes(language));
        if (matchedVoice) utterance.voice = matchedVoice;

        if (onComplete) {
          utterance.onend = onComplete;
          utterance.onerror = onComplete;
        }

        window.speechSynthesis.speak(utterance);
      } else if (onComplete) {
        onComplete();
      }
    }, 450);
  } catch (err) {
    console.warn('Pre-entry audio warning error:', err);
    if (onComplete) onComplete();
  }
}
