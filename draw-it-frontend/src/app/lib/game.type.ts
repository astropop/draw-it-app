// app/types/game.types.ts

// Enums
export enum GameStatus {
  WAITING = "WAITING",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export enum GameMode {
  // MULTIPLAYER = "MULTIPLAYER",
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
  words: string[];
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
  currentDrawerSessionId: string;
  action: string;
}

// websocket
export interface SubmitDrawingRequest {
  roundId: number;
  drawingData: string;
  selectedWord: string;
}

// websocket
export interface SubmitDrawingResponse {
  containsText: boolean;
  containsKeyword: boolean;
  warning?: string;
}

// websocket
export interface SubmitGuessRequest {
  roundId: number;
  guess: string;
}

// websocket
export interface KickPlayerRequest {
  targetSessionId: string;
}
// websocket
export interface KickPlayerResponse {
  kicked: boolean;
  reason: string;
  gameCode: string;
}

// WebSocket Message Types
export interface PlayerUpdateMessage {
  type: "PLAYER_JOINED" | "PLAYER_LEFT" | "SCORE_UPDATED";
  nickname: string;
  sessionId: string;
  score?: number;
}

// websocket
export interface PlayerListUpdate {
  players: PlayerDto[];
}
// websocket
export interface DrawingSubmittedMessage {
  roundId: number;
  drawer: string;
  drawingData: string;
  containsText: boolean;
  containsKeyword: boolean;
}
// websocket
export interface GuessSubmittedMessage {
  roundId: number;
  playerNickname: string;
  guess: string;
  isCorrect: boolean;
  pointsEarned: number;
}

// websocket
export interface GameStateMessage {
  type: "GAME_STARTED" | "NEXT_ROUND" | "GAME_FINISHED";
  gameCode: string;
  currentRound?: number;
  maxRounds?: number;
  currentDrawer?: string;
  status?: GameStatus;
}
