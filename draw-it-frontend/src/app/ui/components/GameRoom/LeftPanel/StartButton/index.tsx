import { GameResponseDto } from "@/app/lib/game.type";
import { Divider, Button, Typography } from "@mui/material";

export type StartButtonProps = {
  currentPlayerSessionId: string;
  handleStartGame: (currentPlayerSessionId: string) => Promise<void>;
  localGameState: GameResponseDto;
};

const StartButton = ({ props }: { props: StartButtonProps }) => {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Button
        variant='contained'
        fullWidth
        onClick={() => props.handleStartGame(props.currentPlayerSessionId)}
        disabled={props.localGameState.players.length < 2}
        size='large'
      >
        Start Game
      </Button>
      {props.localGameState.players.length < 2 && (
        <Typography
          variant='caption'
          color='error'
          sx={{ mt: 1, display: "block" }}
        >
          Need at least 2 players
        </Typography>
      )}
    </>
  );
};

export default StartButton;
