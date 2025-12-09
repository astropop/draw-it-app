export interface SubmitGuessRequestDto {
  roundNumber: number;
  turnNumber: number;
  guess: string;
  guessingTimeLeft: number;
  playerSessionId: string;
}

export interface SubmitGuessResponseDto {
  isCorrect: boolean;
  pointsEarned: number;
  correctWord: string; // TODO remove later
}
