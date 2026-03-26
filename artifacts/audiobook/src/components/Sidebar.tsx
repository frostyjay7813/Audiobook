import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { bookData } from '@/data/bookContent';
import { CheckCircle2, Circle, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function Sidebar() {
  const { 
    isSidebarOpen, 
    setSidebarOpen, 
    currentChapterIndex, 
    completedChapters,
    goToChapter
  } = usePlayerStore();

  if (!isSidebarOpen) return null;

  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col shadow-2xl z-20 absolute md:relative transition-all duration-300">
      <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground font-sans tracking-tight">Contents</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden hover:bg-destructive/10 hover:text-destructive transition-colors">
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {bookData.chapters.map((chapter, index) => {
          const isCurrent = currentChapterIndex === index;
          const isCompleted = completedChapters.includes(index);
          
          return (
            <button
              key={chapter.id}
              onClick={() => {
                goToChapter(index);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-200 flex gap-4 group",
                isCurrent 
                  ? "bg-primary/10 border-primary/30 border shadow-sm shadow-primary/5" 
                  : "hover:bg-secondary border border-transparent hover:border-border/50"
              )}
            >
              <div className="mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5 text-primary fill-primary/20" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground/70 transition-colors">
                  Chapter {index + 1}
                </span>
                <p className={cn(
                  "text-sm font-medium leading-tight font-serif",
                  isCurrent ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {chapter.title.split(': ').pop()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
