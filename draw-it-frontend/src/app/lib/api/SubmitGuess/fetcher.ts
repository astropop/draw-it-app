"use server";
import { cookies } from "next/headers";
import { fetchApi } from "../../api";
import { SubmitGuessRequestDto, SubmitGuessResponseDto } from "./type";

export const submitGuess = async (
  gameCode: string,
  data: SubmitGuessRequestDto
): Promise<SubmitGuessResponseDto> => {
  console.log("submitGuess", data);
  const cookiesStore = await cookies();
  const playerSessionId = cookiesStore.get("playerSessionId")?.value;

  const submitData = { ...data, playerSessionId };

  return await fetchApi<SubmitGuessResponseDto>(
    `/api/games/${gameCode}/submit-guess`,
    {
      method: "POST",
      body: JSON.stringify(submitData),
    }
  );
};
