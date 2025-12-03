"use client";

import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import ButtonGameCard from "./_components/ButtonGameCard";
import { GameListItemResponseDto } from "@/app/api/GetGameList/type";
import { GameStatus } from "@/app/types/game.type";

type GameCardProps = {
  game: GameListItemResponseDto;
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
  const router = useRouter();
  return (
    <>
      <Card
        sx={{
          cursor: "pointer",
          "&:hover": { boxShadow: 6 },
          border: "1px solid gray",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant='h6'>Theme: {game.theme}</Typography>
            <Chip
              label={getStatusLabel(game.status)}
              color={getStatusColor(game.status)}
              size='small'
            />
          </Box>

          <Typography variant='body2' color='text.secondary' gutterBottom>
            Game code: {game.gameCode}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            Players: {game.playerCount}
          </Typography>

          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mt: 1 }}
          >
            Created at: {new Date(game.createdAt).toLocaleString("en-US")}
          </Typography>

          {game.status === GameStatus.IN_PROGRESS && (
            <ButtonGameCard
              url={`/spectate/${game.gameCode}`}
              props={{ variant: "outlined" }}
              textBtn={"Spectator"}
            />
          )}

          {game.status === GameStatus.FINISHED && (
            <ButtonGameCard
              url={`/spectate/${game.gameCode}`}
              props={{ variant: "outlined" }}
              textBtn={"Result"}
            />
          )}

          {game.status === GameStatus.WAITING && (
            <ButtonGameCard
              url={`/join`}
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
