import { PlayerDTO } from "@/app/types/game.type";
import { Divider, Button, Typography } from "@mui/material";

export type StartButtonProps = {
  handleStartGame: () => Promise<void>;
  currentPlayers: PlayerDTO[];
};

const StartButton = ({ props }: { props: StartButtonProps }) => {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Button
        variant='contained'
        fullWidth
        onClick={props.handleStartGame}
        disabled={props.currentPlayers.length < 2}
        size='large'
      >
        Start Game
      </Button>
      {props.currentPlayers.length < 2 && (
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
