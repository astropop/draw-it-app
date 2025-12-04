import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { getStatusColor, getStatusLabel } from "@/app/ui/utils";
import { Paper, Grid, Typography, Chip, Stack, Box } from "@mui/material";

export type RoomHeaderProps = {
  localGameState: GameResponseDto;
  currentNickname: string;
};

const RoomHeader = ({ localGameState, currentNickname }: RoomHeaderProps) => {
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography
                variant='h5'
                color='text.secondary'
                sx={{ mt: 1 }}
                component='h1'
              >
                Theme: {localGameState.theme}
              </Typography>
              <Chip
                label={getStatusLabel(localGameState.status)}
                color={getStatusColor(localGameState.status)}
                size='small'
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography variant='body2'>Game Room:</Typography>
              <Chip label={localGameState.gameCode} color='primary' />
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                You: {currentNickname}
              </Typography>
              {localGameState.isHost && (
                <Chip label='Host' color='primary' size='small' />
              )}
            </Box>
          </Grid>

          <Grid sx={{ textAlign: { xs: "left", md: "right" }, xs: 12, md: 6 }}>
            <Stack
              direction='row'
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              {localGameState.status === GameStatus.IN_PROGRESS && (
                <Chip
                  label={`Round ${localGameState.currentRound} / ${localGameState.maxRounds}`}
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
