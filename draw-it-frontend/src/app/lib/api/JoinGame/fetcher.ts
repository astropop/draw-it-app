"use server";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";
import { JoinGameRequestDto } from "./type";

export const joinGame = async (
  data: JoinGameRequestDto
): Promise<GameResponseDto> => {
  return await fetchApi<GameResponseDto>("/api/games/join", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
