import { SortType } from "../../validation";

export interface GameListRequestDto {
  page: number;
  sort: SortType;
  pageSize: number;
}

export interface GameListResponseDto {
  totalGame: number;
  gameItemList: GameListItemResponseDto[];
}

export interface GameListItemResponseDto {
  gameCode: string;
  theme: string;
  status: string;
  playerCount: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}
