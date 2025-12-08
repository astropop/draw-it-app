import { GameResponseDto } from "@/app/lib/game.type";
import { Box, Typography } from "@mui/material";

export type GameAreaWaitingProps = {
  localGameState: GameResponseDto;
  isHost: boolean;
};
const GameAreaWaiting = ({ props }: { props: GameAreaWaitingProps }) => {
  return (
    <>
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant='h5' gutterBottom>
          {props.isHost
            ? 'Click "Start Game" when having enough players!'
            : "Waiting for host to start..."}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {props.localGameState.players.length} players joined
        </Typography>
      </Box>
    </>
  );
};

export default GameAreaWaiting;
