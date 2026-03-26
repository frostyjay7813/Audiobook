import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  userProgressTable,
  bookmarksTable,
  userSettingsTable,
} from "@workspace/db/schema";
import {
  SaveProgressBody,
  AddBookmarkBody,
  DeleteBookmarkParams,
  SaveSettingsBody,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Helper: get or create the single progress row
async function getOrCreateProgress() {
  const rows = await db.select().from(userProgressTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db
    .insert(userProgressTable)
    .values({ chapterIndex: 0, paragraphIndex: 0, completedChapters: "[]" })
    .returning();
  return created;
}

// Helper: get or create the single settings row
async function getOrCreateSettings() {
  const rows = await db.select().from(userSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db
    .insert(userSettingsTable)
    .values({})
    .returning();
  return created;
}

// GET /api/progress
router.get("/progress", async (req, res) => {
  try {
    const progress = await getOrCreateProgress();
    res.json({
      chapterIndex: progress.chapterIndex,
      paragraphIndex: progress.paragraphIndex,
      completedChapters: JSON.parse(progress.completedChapters || "[]"),
      lastUpdated: progress.lastUpdated.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/progress
router.post("/progress", async (req, res) => {
  try {
    const body = SaveProgressBody.parse(req.body);
    const existing = await getOrCreateProgress();
    const [updated] = await db
      .update(userProgressTable)
      .set({
        chapterIndex: body.chapterIndex,
        paragraphIndex: body.paragraphIndex,
        completedChapters: JSON.stringify(body.completedChapters),
        lastUpdated: new Date(),
      })
      .where(eq(userProgressTable.id, existing.id))
      .returning();
    res.json({
      chapterIndex: updated.chapterIndex,
      paragraphIndex: updated.paragraphIndex,
      completedChapters: JSON.parse(updated.completedChapters || "[]"),
      lastUpdated: updated.lastUpdated.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save progress");
    res.status(400).json({ error: "Invalid request" });
  }
});

// GET /api/bookmarks
router.get("/bookmarks", async (req, res) => {
  try {
    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .orderBy(bookmarksTable.createdAt);
    res.json(
      bookmarks.map((b) => ({
        id: b.id,
        chapterIndex: b.chapterIndex,
        paragraphIndex: b.paragraphIndex,
        chapterTitle: b.chapterTitle,
        excerpt: b.excerpt,
        createdAt: b.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get bookmarks");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookmarks
router.post("/bookmarks", async (req, res) => {
  try {
    const body = AddBookmarkBody.parse(req.body);
    const [bookmark] = await db
      .insert(bookmarksTable)
      .values({
        chapterIndex: body.chapterIndex,
        paragraphIndex: body.paragraphIndex,
        chapterTitle: body.chapterTitle,
        excerpt: body.excerpt,
      })
      .returning();
    res.status(201).json({
      id: bookmark.id,
      chapterIndex: bookmark.chapterIndex,
      paragraphIndex: bookmark.paragraphIndex,
      chapterTitle: bookmark.chapterTitle,
      excerpt: bookmark.excerpt,
      createdAt: bookmark.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add bookmark");
    res.status(400).json({ error: "Invalid request" });
  }
});

// DELETE /api/bookmarks/:id
router.delete("/bookmarks/:id", async (req, res) => {
  try {
    const { id } = DeleteBookmarkParams.parse({ id: parseInt(req.params.id, 10) });
    await db.delete(bookmarksTable).where(eq(bookmarksTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete bookmark");
    res.status(400).json({ error: "Invalid request" });
  }
});

// GET /api/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      playbackRate: settings.playbackRate,
      voiceURI: settings.voiceURI ?? "",
      theme: settings.theme,
      fontSize: settings.fontSize,
      autoScroll: settings.autoScroll,
      highlightWords: settings.highlightWords,
      pitch: settings.pitch,
      volume: settings.volume,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/settings
router.post("/settings", async (req, res) => {
  try {
    const body = SaveSettingsBody.parse(req.body);
    const existing = await getOrCreateSettings();
    const [updated] = await db
      .update(userSettingsTable)
      .set({
        playbackRate: body.playbackRate,
        voiceURI: body.voiceURI ?? null,
        theme: body.theme,
        fontSize: body.fontSize,
        autoScroll: body.autoScroll,
        highlightWords: body.highlightWords,
        pitch: body.pitch,
        volume: body.volume,
      })
      .where(eq(userSettingsTable.id, existing.id))
      .returning();
    res.json({
      playbackRate: updated.playbackRate,
      voiceURI: updated.voiceURI ?? "",
      theme: updated.theme,
      fontSize: updated.fontSize,
      autoScroll: updated.autoScroll,
      highlightWords: updated.highlightWords,
      pitch: updated.pitch,
      volume: updated.volume,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save settings");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
