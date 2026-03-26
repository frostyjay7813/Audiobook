import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bookData } from '../data/bookContent';
import type { UserSettings } from '@workspace/api-client-react/src/generated/api.schemas';

interface PlayerState {
  // Playback State
  isPlaying: boolean;
  isPaused: boolean; // Differentiates between stopped and paused
  currentChapterIndex: number;
  currentParagraphIndex: number;
  currentSentenceIndex: number;
  
  // Progress
  completedChapters: number[];
  
  // Settings (initialized from API but managed locally for responsiveness)
  settings: UserSettings;

  // UI State
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  isBookmarksOpen: boolean;
  sleepTimerMinutes: number | null; // null means off
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  
  // Navigation
  goToChapter: (index: number) => void;
  goToParagraph: (cIndex: number, pIndex: number) => void;
  goToSentence: (cIndex: number, pIndex: number, sIndex: number) => void;
  nextSentence: () => boolean; // returns true if moved, false if end of book
  prevSentence: () => void;
  nextChapter: () => void;
  prevChapter: () => void;
  
  // State Updates
  markChapterComplete: (index: number) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setBookmarksOpen: (isOpen: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;
  
  // Sync
  hydrateFromApi: (progress: { chapterIndex: number, paragraphIndex: number, completedChapters: number[] }, settings: UserSettings) => void;
}

const defaultSettings: UserSettings = {
  playbackRate: 1,
  theme: 'dark',
  fontSize: 'text-lg',
  autoScroll: true,
  highlightWords: true, // We'll use this for sentence highlight
  pitch: 1,
  volume: 1,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      isPaused: false,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      currentSentenceIndex: 0,
      completedChapters: [],
      settings: defaultSettings,
      
      isSidebarOpen: true,
      isSettingsOpen: false,
      isBookmarksOpen: false,
      sleepTimerMinutes: null,

      play: () => set({ isPlaying: true, isPaused: false }),
      pause: () => set({ isPlaying: false, isPaused: true }),
      stop: () => set({ isPlaying: false, isPaused: false }),
      
      togglePlayPause: () => {
        const { isPlaying } = get();
        if (isPlaying) get().pause();
        else get().play();
      },

      goToChapter: (index) => {
        if (index >= 0 && index < bookData.chapters.length) {
          set({ 
            currentChapterIndex: index, 
            currentParagraphIndex: 0, 
            currentSentenceIndex: 0,
            isPlaying: true, // Auto-play when manually navigating
            isPaused: false
          });
        }
      },

      goToParagraph: (cIndex, pIndex) => {
        set({ 
          currentChapterIndex: cIndex, 
          currentParagraphIndex: pIndex, 
          currentSentenceIndex: 0,
          isPlaying: true,
          isPaused: false
        });
      },

      goToSentence: (cIndex, pIndex, sIndex) => {
        set({ 
          currentChapterIndex: cIndex, 
          currentParagraphIndex: pIndex, 
          currentSentenceIndex: sIndex,
          isPlaying: true,
          isPaused: false
        });
      },

      nextSentence: () => {
        const { currentChapterIndex: c, currentParagraphIndex: p, currentSentenceIndex: s } = get();
        const chapter = bookData.chapters[c];
        const paragraph = chapter.paragraphs[p];

        if (s + 1 < paragraph.sentences.length) {
          set({ currentSentenceIndex: s + 1 });
          return true;
        } else if (p + 1 < chapter.paragraphs.length) {
          set({ currentParagraphIndex: p + 1, currentSentenceIndex: 0 });
          return true;
        } else if (c + 1 < bookData.chapters.length) {
          get().markChapterComplete(c);
          set({ currentChapterIndex: c + 1, currentParagraphIndex: 0, currentSentenceIndex: 0 });
          return true;
        } else {
          get().markChapterComplete(c);
          get().stop();
          return false; // End of book
        }
      },

      prevSentence: () => {
        const { currentChapterIndex: c, currentParagraphIndex: p, currentSentenceIndex: s } = get();
        
        if (s > 0) {
          set({ currentSentenceIndex: s - 1 });
        } else if (p > 0) {
          const prevParagraph = bookData.chapters[c].paragraphs[p - 1];
          set({ currentParagraphIndex: p - 1, currentSentenceIndex: prevParagraph.sentences.length - 1 });
        } else if (c > 0) {
          const prevChapter = bookData.chapters[c - 1];
          const lastParaIdx = prevChapter.paragraphs.length - 1;
          const lastSentenceIdx = prevChapter.paragraphs[lastParaIdx].sentences.length - 1;
          set({ currentChapterIndex: c - 1, currentParagraphIndex: lastParaIdx, currentSentenceIndex: lastSentenceIdx });
        }
      },

      nextChapter: () => {
        const { currentChapterIndex } = get();
        if (currentChapterIndex + 1 < bookData.chapters.length) {
          get().markChapterComplete(currentChapterIndex);
          get().goToChapter(currentChapterIndex + 1);
        }
      },

      prevChapter: () => {
        const { currentChapterIndex } = get();
        if (currentChapterIndex > 0) {
          get().goToChapter(currentChapterIndex - 1);
        }
      },

      markChapterComplete: (index) => set((state) => ({
        completedChapters: Array.from(new Set([...state.completedChapters, index]))
      })),

      updateSettings: (newSettings) => set((state) => {
        // Apply theme class to document body immediately
        if (newSettings.theme && newSettings.theme !== state.settings.theme) {
           document.body.className = document.body.className.replace(/theme-\w+/, '').trim();
           if (newSettings.theme !== 'dark') {
             document.body.classList.add(`theme-${newSettings.theme}`);
           }
        }
        return { settings: { ...state.settings, ...newSettings } };
      }),

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setBookmarksOpen: (isOpen) => set({ isBookmarksOpen: isOpen }),
      setSleepTimer: (minutes) => set({ sleepTimerMinutes: minutes }),

      hydrateFromApi: (progress, apiSettings) => {
        set((state) => ({
          currentChapterIndex: progress.chapterIndex,
          currentParagraphIndex: progress.paragraphIndex,
          completedChapters: progress.completedChapters,
          settings: { ...state.settings, ...apiSettings },
          // Don't override sentence index from api as we don't save it to be that precise
        }));
        
        // Apply theme immediately on hydrate
        document.body.className = document.body.className.replace(/theme-\w+/, '').trim();
        if (apiSettings.theme && apiSettings.theme !== 'dark') {
          document.body.classList.add(`theme-${apiSettings.theme}`);
        }
      }
    }),
    {
      name: 'audiobook-storage',
      partialize: (state) => ({ 
        currentChapterIndex: state.currentChapterIndex,
        currentParagraphIndex: state.currentParagraphIndex,
        currentSentenceIndex: state.currentSentenceIndex,
        completedChapters: state.completedChapters,
        settings: state.settings 
      }), // only persist progress and settings locally as fallback
    }
  )
);
