// GameLobby
"use client";

import { getGameList } from "@/app/lib/api";
import { GameItemList } from "@/app/types/game.type";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GameCard from "./GameCard";

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameLobby({
  initialGames,
}: {
  initialGames: GameItemList[];
}) {
  const [games, setGames] = useState<GameItemList[]>(initialGames);
  const router = useRouter();

  // useEffect(() => {
  //   // Poll for updates every 5 seconds
  //   const interval = setInterval(async () => {
  //     const updatedGames = await getGameList();
  //     setGames(updatedGames);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "info";
      case "IN_PROGRESS":
        return "warning";
      case "FINISHED":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Đang chờ";
      case "IN_PROGRESS":
        return "Đang chơi";
      case "FINISHED":
        return "Đã kết thúc";
      default:
        return status;
    }
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
        <Typography variant='h4'>Danh sách Game</Typography>
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          <Button component={Link} href='/join' variant='contained'>
            Join Game
          </Button>
          <Button variant='contained' onClick={() => router.push("/create")}>
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
            Chưa có game nào. Hãy tạo game đầu tiên!
          </Typography>
        </Box>
      )}
    </Container>
  );
}
