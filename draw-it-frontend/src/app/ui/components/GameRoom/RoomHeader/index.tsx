import { GameResponseDTO, GameStatus } from "@/app/lib/game.type";
import { Paper, Grid, Typography, Chip, Stack } from "@mui/material";
import { connected } from "process";

export type RoomHeaderProps = {
  gameData: GameResponseDTO;
  localGameState: GameResponseDTO;
  currentNickname: string;
  isHost: boolean;
};

const RoomHeader = ({ props }: { props: RoomHeaderProps }) => {
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant='h4' component='h1'>
              Game Room:{" "}
              <Chip label={props.gameData.gameCode} color='primary' />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Theme: {props.localGameState.theme}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              You: {props.currentNickname} ({props.isHost ? "Host" : "Player"})
            </Typography>
          </Grid>

          <Grid sx={{ textAlign: { xs: "left", md: "right" }, xs: 12, md: 6 }}>
            <Stack
              direction='row'
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              <Chip
                label={connected ? "Connected" : "Disconnected"}
                color={connected ? "success" : "error"}
                size='small'
              />
              {props.localGameState.status === GameStatus.IN_PROGRESS && (
                <Chip
                  label={`Round ${props.localGameState.currentRound} / ${props.localGameState.maxRounds}`}
                  color='info'
                  size='small'
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default RoomHeader;
