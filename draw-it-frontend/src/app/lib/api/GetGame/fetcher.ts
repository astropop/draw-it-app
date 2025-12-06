"use server";
import { cookies } from "next/headers";
import { fetchApi } from "../../api";
import { GameResponseDto } from "../../game.type";
import { GetGameRequestDto } from "./type";

export const getGame = async (gameCode: string): Promise<GameResponseDto> => {
  const cookiesStore = await cookies();
  const playerSessionId = cookiesStore.get("playerSessionId")?.value;

  const submitData = {
    playerSessionId,
  } as GetGameRequestDto;

  return await fetchApi<GameResponseDto>(`/api/games/${gameCode}`, {
    method: "POST",
    body: JSON.stringify(submitData),
  });
};
