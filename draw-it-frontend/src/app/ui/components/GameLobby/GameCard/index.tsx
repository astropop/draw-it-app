"use client";

import { GameItemList } from "@/app/types/game.type";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import router from "next/router";
import ButtonGameCard from "./_components/ButtonGameCard";

type GameCardProps = {
  game: GameItemList;
  getStatusLabel: (status: string) => string;
  getStatusColor: (
    status: string
  ) =>
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
};

const GameCard = ({ game, getStatusLabel, getStatusColor }: GameCardProps) => {
  return (
    <>
      <Card
        sx={{
          cursor: "pointer",
          "&:hover": { boxShadow: 6 },
          border: "1px solid gray",
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
            <ButtonGameCard
              url={`/spectate/${game.gameCode}`}
              props={{ variant: "outlined" }}
              textBtn={"Spectator"}
            />
          )}

          {game.status === "FINISHED" && (
            <ButtonGameCard
              url={`/spectate/${game.gameCode}`}
              props={{ variant: "outlined" }}
              textBtn={"Result"}
            />
          )}

          {game.status === "WAITING" && (
            <ButtonGameCard
              url={`/spectate/${game.gameCode}`}
              props={{ variant: "contained" }}
              textBtn={"Join"}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default GameCard;
