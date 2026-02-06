import * as z from "zod/v4";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  contentJson: z.string().max(500_000).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  contentJson: z.string().max(500_000).optional(),
});

export const shareNoteSchema = z.object({
  isPublic: z.boolean(),
});
