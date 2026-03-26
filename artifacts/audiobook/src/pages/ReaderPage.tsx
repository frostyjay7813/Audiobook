import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PlayerControls } from '@/components/PlayerControls';
import { TextDisplay } from '@/components/TextDisplay';
import { SettingsModal } from '@/components/SettingsModal';
import { useGetProgress, useGetSettings } from '@workspace/api-client-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTTS } from '@/hooks/use-tts';
import { useSync } from '@/hooks/use-sync';
import { Loader2 } from 'lucide-react';

export default function ReaderPage() {
  const { hydrateFromApi } = usePlayerStore();
  
  // Fetch initial data from backend
  const { data: progress, isLoading: isProgressLoading } = useGetProgress();
  const { data: settings, isLoading: isSettingsLoading } = useGetSettings();

  // Initialize Web Speech API
  useTTS();
  
  // Setup sync to backend
  useSync();

  // Hydrate store on load
  useEffect(() => {
    if (progress && settings) {
      hydrateFromApi(progress, settings);
    }
  }, [progress, settings, hydrateFromApi]);

  if (isProgressLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-serif tracking-widest uppercase text-sm">Opening Book...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative">
        <TextDisplay />
        <PlayerControls />
      </div>
      <SettingsModal />
    </div>
  );
}
