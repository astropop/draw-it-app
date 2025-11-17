import { GameResponseDTO, PlayerDTO } from "@/app/types/game.type";
import { Box, Typography } from "@mui/material";

export type GameAreaWaitingProps = {
  localGameState: GameResponseDTO;
  isHost: boolean;
  currentPlayers: PlayerDTO[];
};
const GameAreaWaiting = ({ props }: { props: GameAreaWaitingProps }) => {
  return (
    <>
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant='h5' gutterBottom>
          {props.isHost
            ? 'Click "Start Game" when ready!'
            : "Waiting for host to start..."}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {props.currentPlayers.length} players joined
        </Typography>
      </Box>
    </>
  );
};

export default GameAreaWaiting;
