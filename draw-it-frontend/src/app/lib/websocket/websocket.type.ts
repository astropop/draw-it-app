// websocket
export interface KickPlayerRequestDto {
  targetPlayerSessionId: string;
}

// websocket
export interface KickPlayerResponseDto {
  targetPlayerSessionId: string;
  kicked: boolean;
  reason: string;
  gameCode: string;
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

// WebSocket Message Types
export interface PlayerUpdateMessage {
  type: "PLAYER_JOINED" | "PLAYER_LEFT" | "SCORE_UPDATED";
  nickname: string;
  sessionId: string;
  score?: number;
}

// websocket
export interface PlayerListUpdate {
  //   players: PlayerDto[];
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
  //   status?: GameStatus;
}
