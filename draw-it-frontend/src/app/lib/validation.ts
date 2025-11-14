// app/lib/validations.ts
import { z } from "zod";

export const createGameSchema = z.object({
  theme: z.string().min(1).max(100),
  language: z.enum(["English", "Vietnamese", "Spanish"]),
  maxRounds: z.number().min(1).max(5),
  drawingTime: z.number().min(30).max(300),
  guessingTime: z.number().min(30).max(180),
  gameMode: z.enum(["MULTIPLAYER", "VERSUS"]),
  turnMode: z.enum(["SEQUENTIAL", "RANDOM"]),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
