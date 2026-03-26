import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { bookData } from '@/data/bookContent';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function TextDisplay() {
  const { 
    currentChapterIndex, 
    currentParagraphIndex, 
    currentSentenceIndex,
    settings,
    goToSentence
  } = usePlayerStore();

  const chapter = bookData.chapters[currentChapterIndex];
  const activeSentenceRef = useRef<HTMLSpanElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (settings.autoScroll && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [currentSentenceIndex, currentParagraphIndex, settings.autoScroll]);

  if (!chapter) return null;

  return (
    <div 
      ref={scrollContainerRef}
      className={cn(
        "flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 scroll-smooth",
        settings.fontSize
      )}
    >
      <div className="max-w-3xl mx-auto pb-40 pt-10">
        
        {/* Chapter Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={`header-${currentChapterIndex}`}
          className="mb-16 md:mb-24 text-center space-y-6"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm md:text-base">
            Chapter {currentChapterIndex + 1}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-reading font-bold text-foreground leading-tight text-balance">
            {chapter.title.split(': ').pop()}
          </h1>
          <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full mt-8" />
        </motion.div>

        {/* Paragraphs */}
        <div className="space-y-8 md:space-y-12">
          {chapter.paragraphs.map((paragraph, pIndex) => (
            <p 
              key={paragraph.id} 
              className="font-reading leading-relaxed md:leading-[1.8] text-muted-foreground"
            >
              {paragraph.sentences.map((sentence, sIndex) => {
                const isActive = pIndex === currentParagraphIndex && sIndex === currentSentenceIndex;
                const isPast = pIndex < currentParagraphIndex || (pIndex === currentParagraphIndex && sIndex < currentSentenceIndex);

                return (
                  <span
                    key={sentence.id}
                    ref={isActive ? activeSentenceRef : null}
                    onClick={() => goToSentence(currentChapterIndex, pIndex, sIndex)}
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded px-0.5 mx-[-2px]",
                      isActive && settings.highlightWords 
                        ? "bg-highlight text-highlight-foreground shadow-[0_0_10px_rgba(217,119,6,0.1)]" 
                        : isPast 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground/80 hover:bg-secondary/50"
                    )}
                  >
                    {sentence.text}{' '}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
