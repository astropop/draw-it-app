export interface SubmitDrawingRequestDto {
  roundNumber: number;
  turnNumber: number;
  drawingData: string;
  selectedWord: string;
  drawingTimeLeft: number;
  playerSessionId: string;
}

export interface SubmitDrawingResponseDto {
  success: boolean;
  containingKeyword: string;
  pointsPenalty: number;
  nextDrawerPlayerSessionId: string; /// TODO remove later
}
