// GameLobby
"use client";

import { getGameList } from "@/app/lib/api/GetGameList/fetcher";
import { GameListItemResponseDto } from "@/app/lib/api/GetGameList/type";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { getStatusColor, getStatusLabel } from "../../utils";
import GameCard from "./GameCard";

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameLobby({
  initialGames,
}: {
  initialGames: GameListItemResponseDto[];
}) {
  const [games, setGames] = useState<GameListItemResponseDto[]>(initialGames);

  const handleRefresh = async () => {
    const updatedGames = await getGameList();
    setGames(updatedGames);
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

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={game.gameCode}>
            <GameCard
              game={game}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
            />
          </Grid>
        ))}
      </Grid>

      {games.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant='h6' color='text.secondary'>
            No games available. Be the first to create one!
          </Typography>
        </Box>
      )}
    </Container>
  );
}
