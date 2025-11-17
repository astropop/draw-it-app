import TimerIcon from "@mui/icons-material/Timer";
import { GameResponseDTO } from "@/app/types/game.type";
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
export type TimerProps = {
  timerType: "drawing" | "guessing" | null;
  timeLeft: number;
  localGameState: GameResponseDTO;
};

const Timer = ({ props }: { props: TimerProps }) => {
  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <TimerIcon sx={{ mr: 1 }} />
            <Typography variant='h6'>
              {props.timerType === "drawing" ? "Drawing Time" : "Guessing Time"}
            </Typography>
          </Box>
          <Typography
            variant='h3'
            color={props.timeLeft <= 10 ? "error" : "primary"}
          >
            {props.timeLeft}s
          </Typography>
          <LinearProgress
            variant='determinate'
            value={
              (props.timeLeft /
                (props.timerType === "drawing"
                  ? props.localGameState.drawingTime!
                  : props.localGameState.guessingTime!)) *
              100
            }
            sx={{ mt: 1 }}
            color={props.timeLeft <= 10 ? "error" : "primary"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Timer;
