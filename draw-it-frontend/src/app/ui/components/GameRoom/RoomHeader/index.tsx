import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { getStatusColor, getStatusLabel } from "@/app/ui/utils";
import { Paper, Grid, Typography, Chip, Stack, Box } from "@mui/material";

export type RoomHeaderProps = {
  localGameState: GameResponseDto; // status in object can be changed later
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
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography variant='body2'>Game Room:</Typography>
              <Chip
                label={localGameState.gameCode}
                color='primary'
                size='small'
              />
              {localGameState.status === GameStatus.IN_PROGRESS && (
                <Chip
                  label={`Round ${localGameState.currentRound} / ${localGameState.maxRounds}`}
                  color='info'
                  size='small'
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography variant='body2'>Status:</Typography>
              <Chip
                label={getStatusLabel(localGameState.status)}
                color={getStatusColor(localGameState.status)}
                size='small'
              />
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
        </Grid>
      </Paper>
    </>
  );
};

export default RoomHeader;
