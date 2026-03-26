import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useSaveProgress, useSaveSettings } from '@workspace/api-client-react';

// Syncs local zustand state to backend API with debouncing
export function useSync() {
  const { currentChapterIndex, currentParagraphIndex, completedChapters, settings } = usePlayerStore();
  const { mutate: saveProgress } = useSaveProgress();
  const { mutate: saveSettings } = useSaveSettings();
  
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Progress
  useEffect(() => {
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    
    progressTimeoutRef.current = setTimeout(() => {
      saveProgress({
        data: {
          chapterIndex: currentChapterIndex,
          paragraphIndex: currentParagraphIndex,
          completedChapters,
        }
      });
    }, 2000); // 2 second debounce for progress

    return () => {
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    };
  }, [currentChapterIndex, currentParagraphIndex, completedChapters, saveProgress]);

  // Sync Settings
  useEffect(() => {
    if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
    
    settingsTimeoutRef.current = setTimeout(() => {
      saveSettings({ data: settings });
    }, 1000); // 1 second debounce for settings

    return () => {
      if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
    };
  }, [settings, saveSettings]);
}
