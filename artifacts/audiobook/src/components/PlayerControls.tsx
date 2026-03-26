import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { bookData } from '@/data/bookContent';
import { Play, Pause, SkipBack, SkipForward, SkipBackIcon, SkipForwardIcon, List, Settings, BookmarkPlus, BookmarkMinus, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useAddBookmark, useGetBookmarks, useDeleteBookmark } from '@workspace/api-client-react/src/generated/api';
import { useToast } from '@/hooks/use-toast';

export function PlayerControls() {
  const { 
    isPlaying, 
    togglePlayPause, 
    currentChapterIndex, 
    currentParagraphIndex,
    currentSentenceIndex,
    prevSentence, 
    nextSentence,
    setSidebarOpen,
    isSidebarOpen,
    setSettingsOpen
  } = usePlayerStore();
  
  const { toast } = useToast();

  const chapter = bookData.chapters[currentChapterIndex];
  
  // Calculate rough progress within chapter based on paragraphs
  const progressPercent = (currentParagraphIndex / (chapter?.paragraphs.length || 1)) * 100;

  // Bookmarks Logic
  const { data: bookmarks = [] } = useGetBookmarks();
  const { mutate: addBookmark } = useAddBookmark();
  const { mutate: removeBookmark } = useDeleteBookmark();

  const currentBookmark = bookmarks.find(b => 
    b.chapterIndex === currentChapterIndex && 
    b.paragraphIndex === currentParagraphIndex
  );

  const toggleBookmark = () => {
    if (currentBookmark) {
      removeBookmark({ id: currentBookmark.id }, {
        onSuccess: () => toast({ description: "Bookmark removed", variant: "default" })
      });
    } else {
      addBookmark({
        data: {
          chapterIndex: currentChapterIndex,
          paragraphIndex: currentParagraphIndex,
          chapterTitle: chapter.title,
          excerpt: chapter.paragraphs[currentParagraphIndex].sentences[0].text.substring(0, 50) + "..."
        }
      }, {
        onSuccess: () => toast({ description: "Bookmark added", variant: "default" })
      });
    }
  };

  return (
    <div className="h-28 md:h-24 bg-card/80 backdrop-blur-xl border-t border-border flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-30">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-secondary cursor-pointer group relative">
        <div 
          className="h-full bg-primary/80 group-hover:bg-primary transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
        {/* Scrubber thumb - visual only for now since we are sentence based */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-primary opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Left Controls */}
        <div className="flex items-center gap-2 md:gap-4 w-1/3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className={isSidebarOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}
          >
            <List className="w-5 h-5" />
          </Button>
          <div className="hidden md:block">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Now Playing</p>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px] font-serif">
              {chapter?.title.split(': ').pop()}
            </p>
          </div>
        </div>

        {/* Center Controls (Playback) */}
        <div className="flex items-center justify-center gap-4 md:gap-6 w-1/3">
          <Button variant="ghost" size="icon" onClick={prevSentence} className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full w-10 h-10 transition-transform active:scale-95">
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={togglePlayPause}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center pl-1"
          >
            {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7 -ml-1" fill="currentColor" /> : <Play className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={nextSentence} className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full w-10 h-10 transition-transform active:scale-95">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleBookmark}
            className={currentBookmark ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}
          >
            {currentBookmark ? <BookmarkMinus className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSettingsOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
