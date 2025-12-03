"use server";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";

import { CreateGameRequestDto } from "./type";

export const createGame = async (
  data: CreateGameRequestDto
): Promise<GameResponseDto> => {
  return await fetchApi<GameResponseDto>("/api/games/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
