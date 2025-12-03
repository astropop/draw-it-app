export interface GameListItemResponseDto {
  gameCode: string;
  theme: string;
  status: string;
  playerCount: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}
