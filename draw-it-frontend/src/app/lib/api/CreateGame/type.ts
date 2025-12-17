import { GameMode } from "../../game.type";

// Request Types
export interface CreateGameRequestDto {
  hostNickname: string;
  theme: string;
  maxRounds: number;
  drawingTime: number;
  guessingTime: number;
  gameMode: GameMode;
}
