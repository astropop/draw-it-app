"use server";
import { cookies } from "next/headers";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";
import { JoinGameRequestDto } from "./type";

export const joinGame = async (
  data: JoinGameRequestDto
): Promise<GameResponseDto> => {
  const response = await fetchApi<GameResponseDto>("/api/games/join", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response) {
    throw new Error("Failed to join game");
  }

  const cookiesStore = await cookies();
  cookiesStore.set("playerSessionId", response.playerSessionId, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  return response;
};
