import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { bookData } from '@/data/bookContent';

export function useTTS() {
  const { 
    isPlaying, 
    currentChapterIndex, 
    currentParagraphIndex, 
    currentSentenceIndex,
    settings,
    nextSentence,
    pause: pauseStore,
    stop: stopStore
  } = usePlayerStore();

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSpeakingRef = useRef(false);

  // Initialize SpeechSynthesis and load voices
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || [];
      // Prefer high quality female voices
      const sortedVoices = [...availableVoices].sort((a, b) => {
        const scoreA = a.name.includes('Premium') || a.name.includes('Neural') || a.name.includes('Natural') ? 1 : 0;
        const scoreB = b.name.includes('Premium') || b.name.includes('Neural') || b.name.includes('Natural') ? 1 : 0;
        return scoreB - scoreA;
      });
      setVoices(sortedVoices);
    };

    loadVoices();
    if (synthRef.current?.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakCurrentSentence = useCallback(() => {
    if (!synthRef.current || !isPlaying) return;

    synthRef.current.cancel(); // Stop any current speech

    const chapter = bookData.chapters[currentChapterIndex];
    if (!chapter) {
      stopStore();
      return;
    }

    const paragraph = chapter.paragraphs[currentParagraphIndex];
    const sentence = paragraph?.sentences[currentSentenceIndex];

    if (!sentence) {
      // Reached end of something unexpectedly, try to move forward
      const moved = nextSentence();
      if (!moved) stopStore();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    
    // Apply Settings
    if (settings.voiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else {
      // Auto-select a good female voice if none selected
      const bestFemale = voices.find(v => 
        (v.name.includes('Samantha') || v.name.includes('Google US English')) ||
        (v.lang.includes('en') && v.name.includes('Female'))
      );
      if (bestFemale) utterance.voice = bestFemale;
    }

    utterance.rate = settings.playbackRate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      // Only proceed if we are still meant to be playing
      if (usePlayerStore.getState().isPlaying) {
        // Small natural pause between sentences
        setTimeout(() => {
            if (usePlayerStore.getState().isPlaying) {
               nextSentence();
            }
        }, 300); 
      }
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      isSpeakingRef.current = false;
      // if (e.error !== 'interrupted') stopStore(); // Don't stop if we just cancelled to play next
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);

  }, [currentChapterIndex, currentParagraphIndex, currentSentenceIndex, isPlaying, settings, voices, nextSentence, stopStore]);

  // Effect to trigger speech when indices or play state changes
  useEffect(() => {
    if (isPlaying) {
      speakCurrentSentence();
    } else if (synthRef.current) {
      synthRef.current.cancel();
      isSpeakingRef.current = false;
    }
  }, [isPlaying, currentChapterIndex, currentParagraphIndex, currentSentenceIndex, speakCurrentSentence]);

  // Handle settings changes while playing
  useEffect(() => {
    if (isPlaying && isSpeakingRef.current) {
        // Restart current sentence with new settings
        speakCurrentSentence();
    }
  }, [settings.playbackRate, settings.pitch, settings.volume, settings.voiceURI]);


  return { voices };
}
