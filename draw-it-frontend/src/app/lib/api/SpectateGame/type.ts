import { GameStatus, PlayerDto } from "../../game.type";

export interface SpectateGameResponseDto {
  gameCode: string;
  theme: string;
  status: GameStatus;
  currentRoundNumber: number;
  currentTurnNumber: number;
  maxRounds: number;
  playersInGame: PlayerDto[];
  allRounds: SpectateGameRoundDto[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface SpectateGameRoundDto {
  roundNumber: number;
  turnNumber: number;
  drawerNickname: string;
  drawerPlayerSessionId: string;
  selectedWord: string;
  drawingData: string;
  drawingTime: number;
  containingText: string;
  penaltyPoints: number; // image includes text
  submitAt: string;
  guesses: GuessDto[];
}

export interface GuessDto {
  playerNickname: string;
  playerSessionId: string;
  guessedWord: string;
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: string;
}
