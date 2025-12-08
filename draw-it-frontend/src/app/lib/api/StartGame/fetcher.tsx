"use server";
import { cookies } from "next/headers";
import { GameResponseDto } from "../../game.type";
import { fetchApi } from "../../api";

export const startGame = async (gameCode: string): Promise<GameResponseDto> => {
  const cookiesStore = await cookies();
  const playerSessionId = cookiesStore.get("playerSessionId")?.value;

  const submitData = { playerSessionId };

  return await fetchApi<GameResponseDto>(`/api/games/${gameCode}/start`, {
    method: "POST",
    body: JSON.stringify(submitData),
  });
};
