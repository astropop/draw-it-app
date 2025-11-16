// app/lib/validations.ts
import { z } from "zod";
import { GameMode } from "../types/game.type";

// Validation schema
export const createGameSchema = z.object({
  hostNickname: z.string().min(1, "Nickname is required").max(50, "Too long"),
  theme: z.string().min(1, "Theme is required").max(100, "Too long"),
  // language: z.enum(["English", "Vietnamese", "Spanish", "French", "Japanese"]),
  maxRounds: z.number().min(1).max(5),
  drawingTime: z.number().min(30).max(300),
  guessingTime: z.number().min(30).max(180),
  gameMode: z.enum(GameMode),
  // turnMode: z.enum(TurnMode).optional(), TODO update in next sprint
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
