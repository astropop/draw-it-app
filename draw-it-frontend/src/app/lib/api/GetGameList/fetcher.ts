"use server";
import { fetchApi } from "@/app/lib/api";
import { gameListQuerySchema } from "@/app/lib/validation";
import { GameListRequestDto, GameListResponseDto } from "./type";

// Get Game list with pagination and sorting
export const getGameList = async (
  params?: GameListRequestDto
): Promise<GameListResponseDto> => {
  // Validate params with Zod
  const validatedParams = gameListQuerySchema.parse({
    page: params?.page ?? 1,
    sort: params?.sort ?? "desc",
  });

  // Build query string
  const queryParams = new URLSearchParams({
    page: validatedParams.page.toString(),
    sort: validatedParams.sort,
    pageSize: (params?.pageSize ?? 10).toString(),
  });

  return await fetchApi<GameListResponseDto>(
    `/api/games/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
};
