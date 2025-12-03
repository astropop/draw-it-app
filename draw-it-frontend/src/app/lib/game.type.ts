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

// Player Types
export interface PlayerDTO {
  nickname: string;
  score: number;
  isHost: boolean;
  sessionId: string;
  joinedOrder?: number;
}

export interface GuestPlayer {
  id: number;
  nickname: string;
  sessionId: string;
  score: number;
  isHost: boolean;
  isActive: boolean;
  joinedAt: string;
}

// Game Types
export interface Game {
  id: number;
  gameCode: string;
  gameMode: GameMode;
  status: GameStatus;
  theme: string;
  language: string;
  maxRounds: number;
  currentRound: number;
  drawingTime: number;
  guessingTime: number;

  hostId: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface GameListItemDTO {
  gameCode: string;
  theme: string;
  status: GameStatus;
  playerCount: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

// Round Types
export interface GuessDTO {
  playerNickname: string;
  guess: string;
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: string;
}

export interface RoundSpectatorDTO {
  roundNumber: number;
  drawer: string;
  selectedWord?: string;
  drawingData?: string;
  containsText: boolean;
  guesses: GuessDTO[];
}

export interface GameSpectatorDTO {
  gameCode: string;
  theme: string;
  status: GameStatus;
  currentRound: number;
  maxRounds: number;
  players: PlayerDTO[];
  currentRoundInfo?: RoundSpectatorDTO;
  allRounds?: RoundSpectatorDTO[];
}

export interface JoinGameRequest {
  gameCode: string;
  nickname: string;
}

export interface SubmitDrawingRequest {
  roundId: number;
  drawingData: string;
  selectedWord: string;
}

export interface SubmitDrawingResponse {
  containsText: boolean;
  containsKeyword: boolean;
  warning?: string;
}

export interface SubmitGuessRequest {
  roundId: number;
  guess: string;
}

export interface KickPlayerRequest {
  targetSessionId: string;
}

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

export interface PlayerListUpdate {
  players: PlayerDTO[];
}

export interface DrawingSubmittedMessage {
  roundId: number;
  drawer: string;
  drawingData: string;
  containsText: boolean;
  containsKeyword: boolean;
}

export interface GuessSubmittedMessage {
  roundId: number;
  playerNickname: string;
  guess: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface GameStateMessage {
  type: "GAME_STARTED" | "NEXT_ROUND" | "GAME_FINISHED";
  gameCode: string;
  currentRound?: number;
  maxRounds?: number;
  currentDrawer?: string;
  status?: GameStatus;
}

// export interface WebSocketMessage {
//   type: string;
//   // data: any; // Can be more specific based on message type
// }

export interface JoinGameRequest {
  gameCode: string;
  nickname: string;
}
