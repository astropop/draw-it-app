// app/types/game.types.ts

// Enums
export enum GameStatus {
  WAITING = "WAITING",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export enum GameMode {
  VERSUS = "VERSUS",
}

export interface PlayerDto {
  nickname: string;
  score: number;
  isHost: boolean;
  playerSessionId: string;
  joinedOrder: number;
}

export interface GameResponseDto {
  gameId: number;
  gameCode: string;

  playerSessionId: string;
  status: GameStatus;
  theme: string;
  maxRounds: number;
  currentRound: number;
  currentTurnNumber: number;
  drawingTime: number;
  guessingTime: number;
  isHost: boolean;
  players: PlayerDto[];
  action: string;
  currentDrawerSessionId: string;
  words: string[];
  guessingImageData: string;
}
