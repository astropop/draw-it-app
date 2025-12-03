"use server";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";
import { GetGameRequestDto } from "./type";

export const getGame = async (
  gameCode: string,
  data: GetGameRequestDto
): Promise<GameResponseDto> => {
  return await fetchApi<GameResponseDto>(`/api/games/${gameCode}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
