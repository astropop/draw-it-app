"use server";
import { fetchApi } from "../../api";
import { SpectateGameResponseDto } from "./type";

export const spectateGame = async (
  gameCode: string
): Promise<SpectateGameResponseDto> => {
  return await fetchApi<SpectateGameResponseDto>(
    `/api/games/${gameCode}/spectate`,
    { method: "GET" }
  );
};
