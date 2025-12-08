"use server";
import { cookies } from "next/headers";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";

import { CreateGameRequestDto } from "./type";

export const createGame = async (
  data: CreateGameRequestDto
): Promise<GameResponseDto> => {
  const response = await fetchApi<GameResponseDto>("/api/games/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response) {
    throw new Error("Failed to create game");
  }

  const cookiesStore = await cookies();
  cookiesStore.set("playerSessionId", response.playerSessionId, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return response;
};
