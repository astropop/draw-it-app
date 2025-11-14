// app/components/GameLobby.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Container,
  Grid,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { mockGamesLobby } from "@/app/mock/mockdata.unified";

interface Game {
  gameCode: string;
  theme: string;
  status: string;
  playerCount: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export const arrLocal: Game[] = [
  {
    gameCode: "1",
    theme: "fruit",
    status: "WAITING",
    playerCount: 2,
    createdAt: "2025-11-14 01:00:00",
    startedAt: "2025-11-14 01:01:00",
  },
  {
    gameCode: "2",
    theme: "animal",
    status: "IN_PROGRESS",
    playerCount: 3,
    createdAt: "2025-11-14 01:02:00",
    startedAt: "2025-11-14 01:03:00",
  },
  {
    gameCode: "3",
    theme: "country",
    status: "FINISHED",
    playerCount: 4,
    createdAt: "2025-11-14 01:04:00",
    startedAt: "2025-11-14 01:05:00",
    finishedAt: "2025-11-14 01:06:00",
  },
];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameLobby({ initialGames }: { initialGames: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const router = useRouter();

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      let updatedGames;
      if (USE_MOCK) {
        updatedGames = mockGamesLobby;
      } else {
        const response = await fetch("/api/games/list");
        updatedGames = await response.json();
      }

      setGames(updatedGames);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        <Button variant='contained' onClick={() => router.push("/create")}>
          Tạo Game Mới
        </Button>
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={game.gameCode}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => router.push(`/spectate/${game.gameCode}`)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant='h6'>{game.gameCode}</Typography>
                  <Chip
                    label={getStatusLabel(game.status)}
                    color={getStatusColor(game.status)}
                    size='small'
                  />
                </Box>

                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Chủ đề: {game.theme}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  Người chơi: {game.playerCount}
                </Typography>

                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                  sx={{ mt: 1 }}
                >
                  Tạo lúc: {new Date(game.createdAt).toLocaleString("vi-VN")}
                </Typography>

                {game.status === "IN_PROGRESS" && (
                  <Button
                    variant='outlined'
                    size='small'
                    sx={{ mt: 2 }}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/spectate/${game.gameCode}`);
                    }}
                  >
                    Xem Trực Tiếp
                  </Button>
                )}

                {game.status === "FINISHED" && (
                  <Button
                    variant='outlined'
                    size='small'
                    sx={{ mt: 2 }}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/spectate/${game.gameCode}`);
                    }}
                  >
                    Xem Kết Quả
                  </Button>
                )}

                {game.status === "WAITING" && (
                  <Button
                    variant='contained'
                    size='small'
                    sx={{ mt: 2 }}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/join/${game.gameCode}`);
                    }}
                  >
                    Tham Gia
                  </Button>
                )}
              </CardContent>
            </Card>
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
