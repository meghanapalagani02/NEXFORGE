import { useState, useEffect, useCallback, useRef } from 'react';

// Sanitize text by stripping markdown symbols and emojis for speech synthesis
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[#*_`~\[\]\(\)\{\}\\]/g, '') // remove markdown symbols
    .replace(/💡|🚀|⚛️|⚠️|✅|❌|🔍|📊|📈|🤖|✨|🏭|📦/g, '') // remove emojis
    .replace(/\n+/g, '. ') // replace newlines with brief pauses
    .replace(/\s+/g, ' ')
    .trim();
}

export interface UseReadAloudReturn {
  isSpeaking: boolean;
  speakingMessageId: string | null;
  speechRate: number;
  isSupported: boolean;
  speak: (text: string, messageId?: string, onEnd?: () => void) => void;
  stop: () => void;
  toggle: (text: string, messageId: string) => void;
  setSpeechRate: (rate: number) => void;
}

export function useReadAloud(): UseReadAloudReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Load preferred voice
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;

      setSelectedVoice(preferred);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, messageId?: string, onEnd?: () => void) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();

      const cleanText = sanitizeTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId || null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, speechRate, selectedVoice]
  );

  const toggle = useCallback(
    (text: string, messageId: string) => {
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
      } else {
        speak(text, messageId);
      }
    },
    [isSpeaking, speakingMessageId, speak, stop]
  );

  return {
    isSpeaking,
    speakingMessageId,
    speechRate,
    isSupported,
    speak,
    stop,
    toggle,
    setSpeechRate
  };
}
