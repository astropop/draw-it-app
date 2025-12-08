// GameLobby
"use client";

import { getGameList } from "@/app/lib/api/GetGameList/fetcher";
import { GameListResponseDto } from "@/app/lib/api/GetGameList/type";
import {
  GameListQueryInput,
  gameListQuerySchema,
  SortType,
} from "@/app/lib/validation";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStatusColor, getStatusLabel } from "../../utils";
import { PaginationControlled } from "../PaginationControlled";
import GameCard from "./GameCard";

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
type GameLobbyProps = {
  initialGames: GameListResponseDto;
  pageSize: number;
};

export default function GameLobby({ initialGames, pageSize }: GameLobbyProps) {
  /*
   * constants
   */

  /*
   * states
   */
  const searchParams = useSearchParams();
  const [games, setGames] = useState<GameListResponseDto>(initialGames);
  const [queryParams, setQueryParams] = useState<GameListQueryInput>({
    page: 1,
    sort: "desc" as const,
  });
  /*
   * hooks
   */
  // Parse and validate URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    const parsed = gameListQuerySchema.safeParse(params);

    if (parsed.success) {
      setQueryParams({
        page: parsed.data.page,
        sort: parsed.data.sort,
      });
    }
  }, [searchParams]);
  /*
   * functions
   */

  //Fetch game list with pagination and sorting
  const fetchGameListWithParams = async (
    page: number,
    sort: SortType
  ): Promise<void> => {
    try {
      const updatedGames = await getGameList({ page, pageSize, sort });

      setGames(updatedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const handleRefresh = async () => {
    await fetchGameListWithParams(queryParams.page, queryParams.sort);
  };

  // Callback function for child component
  const handlePaginationChange = async (page: number, sort: SortType) => {
    await fetchGameListWithParams(page, sort);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          <Typography variant='h4'>Game List</Typography>
          <Button variant='outlined' onClick={handleRefresh}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          <Button component={Link} href='/join' variant='contained'>
            Join Game
          </Button>
          <Button component={Link} href='/create' variant='contained'>
            Create
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <PaginationControlled
          count={initialGames.totalGame}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
        />
      </Box>
      <Grid container spacing={3}>
        {games.gameItemList &&
          games.gameItemList.map((game) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={game.gameCode}>
              <GameCard
                game={game}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            </Grid>
          ))}
      </Grid>

      {games.gameItemList && games.gameItemList.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant='h6' color='text.secondary'>
            No games available. Be the first to create one!
          </Typography>
        </Box>
      )}
    </Container>
  );
}
