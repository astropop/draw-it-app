"use server";
import { fetchApi } from "@/app/lib/api";
import { GameListItemResponseDto } from "./type";

// Get Game list
export const getGameList = async (): Promise<GameListItemResponseDto[]> => {
  return await fetchApi("/api/games/list", { method: "GET" });
};
