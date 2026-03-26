import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  chapterIndex: integer("chapter_index").notNull().default(0),
  paragraphIndex: integer("paragraph_index").notNull().default(0),
  completedChapters: text("completed_chapters").notNull().default("[]"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgressTable).omit({ id: true, lastUpdated: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgressTable.$inferSelect;

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  chapterIndex: integer("chapter_index").notNull(),
  paragraphIndex: integer("paragraph_index").notNull(),
  chapterTitle: text("chapter_title").notNull(),
  excerpt: text("excerpt").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, createdAt: true });
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarksTable.$inferSelect;

export const userSettingsTable = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  playbackRate: real("playback_rate").notNull().default(1),
  voiceURI: text("voice_uri"),
  theme: text("theme").notNull().default("dark"),
  fontSize: text("font_size").notNull().default("medium"),
  autoScroll: boolean("auto_scroll").notNull().default(true),
  highlightWords: boolean("highlight_words").notNull().default(true),
  pitch: real("pitch").notNull().default(1),
  volume: real("volume").notNull().default(1),
});

export const insertUserSettingsSchema = createInsertSchema(userSettingsTable).omit({ id: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettingsTable.$inferSelect;
