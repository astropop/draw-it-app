// app/lib/validations.ts
import { z } from "zod";
import { GameMode } from "../types/game.type";

// Validation schema Creating game
export const createGameSchema = z.object({
  hostNickname: z
    .string()
    .min(1, "Nickname is required")
    .max(50, "Nickname must be from 1 - 50 characters"),
  theme: z
    .string()
    .min(1, "Theme is required")
    .max(100, "Theme must be from 1 - 100 characters"),
  // language: z.enum(["English", "Vietnamese", "Spanish", "French", "Japanese"]),
  maxRounds: z.number().min(1).max(5),
  drawingTime: z.number().min(30).max(300),
  guessingTime: z.number().min(30).max(180),
  gameMode: z.enum(GameMode),
  // turnMode: z.enum(TurnMode).optional(), TODO update in next sprint
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

// Validation schema joining game
export const joinGameSchema = z.object({
  gameCode: z
    .string()
    .min(1, "Game code must be 8 characters")
    .max(10, "Game code must be 8 characters")
    .regex(/^[A-Za-z0-9]+$/, "Game code must contain only letters and numbers"),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .max(50, "Nickname is too long"),
});

export type JoinGameInput = z.infer<typeof joinGameSchema>;

// Validation schema joining game with game code
export interface JoinGameFormPrefilledProps {
  gameCode: string;
}

export const joinGamePrefilledSchema = z.object({
  gameCode: z.string().length(8),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .max(50, "Nickname is too long"),
});

export type JoinGamePrefilledInput = z.infer<typeof joinGamePrefilledSchema>;
