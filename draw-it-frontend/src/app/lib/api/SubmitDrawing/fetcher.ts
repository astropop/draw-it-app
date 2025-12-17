"use server";
import { cookies } from "next/headers";
import { fetchApi } from "../../api";
import { SubmitDrawingRequestDto, SubmitDrawingResponseDto } from "./type";

export const submitDrawing = async (
  gameCode: string,
  data: SubmitDrawingRequestDto
): Promise<SubmitDrawingResponseDto> => {
  const cookiesStore = await cookies();
  const playerSessionId = cookiesStore.get("playerSessionId")?.value;

  const submitData = { ...data, playerSessionId };

  return await fetchApi<SubmitDrawingResponseDto>(
    `/api/games/${gameCode}/submit-drawing`,
    { method: "POST", body: JSON.stringify(submitData) }
  );
};
