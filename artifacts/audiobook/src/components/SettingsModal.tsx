import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useTTS } from '@/hooks/use-tts';
import { X, Volume2, Type, Palette, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from './ui/button';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings, sleepTimerMinutes, setSleepTimer } = usePlayerStore();
  const { voices } = useTTS();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-serif">Preferences</DialogTitle>
            <DialogClose className="rounded-full p-2 hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="w-full flex border-b border-border/50 bg-secondary/30 rounded-none h-12 p-0">
            <TabsTrigger value="audio" className="flex-1 rounded-none data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">Audio</TabsTrigger>
            <TabsTrigger value="display" className="flex-1 rounded-none data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">Display</TabsTrigger>
            <TabsTrigger value="timer" className="flex-1 rounded-none data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">Timer</TabsTrigger>
          </TabsList>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <TabsContent value="audio" className="space-y-6 mt-0 focus:outline-none">
              
              {/* Voice Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Narrator Voice</Label>
                <select 
                  className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={settings.voiceURI || ''}
                  onChange={(e) => updateSettings({ voiceURI: e.target.value })}
                >
                  {voices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Playback Speed</Label>
                  <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">{settings.playbackRate.toFixed(2)}x</span>
                </div>
                <Slider 
                  value={[settings.playbackRate]} 
                  min={0.5} max={2} step={0.1}
                  onValueChange={([val]) => updateSettings({ playbackRate: val })}
                />
              </div>

              {/* Pitch Slider */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voice Pitch</Label>
                   <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">{settings.pitch.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[settings.pitch]} 
                  min={0.5} max={2} step={0.1}
                  onValueChange={([val]) => updateSettings({ pitch: val })}
                />
              </div>

               {/* Volume Slider */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Volume2 className="w-4 h-4" /> Volume
                  </Label>
                   <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">{Math.round(settings.volume * 100)}%</span>
                </div>
                <Slider 
                  value={[settings.volume]} 
                  min={0} max={1} step={0.05}
                  onValueChange={([val]) => updateSettings({ volume: val })}
                />
              </div>

            </TabsContent>

            <TabsContent value="display" className="space-y-8 mt-0 focus:outline-none">
               {/* Theme */}
               <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Palette className="w-4 h-4" /> Reading Theme
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['dark', 'light', 'sepia'].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`py-3 rounded-xl border-2 capitalize font-medium transition-all ${
                        settings.theme === t 
                          ? 'border-primary text-primary bg-primary/5 shadow-md' 
                          : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
               <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Type className="w-4 h-4" /> Text Size
                </Label>
                <div className="flex gap-2">
                  {[
                    { label: 'Aa', value: 'text-base', desc: 'Small' },
                    { label: 'Aa', value: 'text-lg', desc: 'Medium' },
                    { label: 'Aa', value: 'text-xl', desc: 'Large' },
                    { label: 'Aa', value: 'text-2xl', desc: 'Extra' }
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSettings({ fontSize: size.value })}
                      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                        settings.fontSize === size.value 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <span className={`${size.value} font-serif mb-1 leading-none ${settings.fontSize === size.value ? 'text-primary' : 'text-foreground'}`}>{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-scroll" className="text-base font-medium cursor-pointer">Auto-scroll to reading position</Label>
                  <Switch 
                    id="auto-scroll" 
                    checked={settings.autoScroll} 
                    onCheckedChange={(c) => updateSettings({ autoScroll: c })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlight" className="text-base font-medium cursor-pointer">Highlight current sentence</Label>
                  <Switch 
                    id="highlight" 
                    checked={settings.highlightWords} 
                    onCheckedChange={(c) => updateSettings({ highlightWords: c })} 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timer" className="space-y-6 mt-0 focus:outline-none">
               <div className="space-y-4">
                  <p className="text-muted-foreground mb-6">Set a timer to automatically pause playback. Perfect for listening before bed.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[null, 15, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins || 'off'}
                        onClick={() => setSleepTimer(mins)}
                        className={`py-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          sleepTimerMinutes === mins 
                            ? 'border-primary text-primary bg-primary/5 shadow-md' 
                            : 'border-border text-foreground hover:border-border/80 hover:bg-secondary/50'
                        }`}
                      >
                        {mins === null ? (
                          <span className="font-semibold">Off</span>
                        ) : (
                          <>
                            <span className="text-xl font-bold">{mins}</span>
                            <span className="text-xs uppercase tracking-widest opacity-70">Minutes</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
