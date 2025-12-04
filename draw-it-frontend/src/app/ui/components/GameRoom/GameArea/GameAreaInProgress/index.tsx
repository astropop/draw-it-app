import { GameResponseDto } from "@/app/lib/game.type";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DrawingCanvas from "../../../DrawingCanvas";

export type GameAreaInProgressProps = {
  localGameState: GameResponseDto;
  action: string; // draw, guess, wait
  // selectedWord: string;
  // currentDrawing: string | null;
  // roundComplete: boolean;
  // showWarning: boolean;
  // warningMessage: string;

  // guess: string;
  // handleWordSelect: (word: string) => void;
  // handleSubmitDrawing: (imageData: string) => Promise<void>;
  // setGuess: (value: string) => void;
  // handleSubmitGuess: () => Promise<void>;
};

const GameAreaInProgress = ({ props }: { props: GameAreaInProgressProps }) => {
  return (
    <>
      {/* WORD SELECTION - draw */}
      {props.action === "draw" && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant='h5' gutterBottom>
            Choose a word to draw:
          </Typography>
          <Stack
            direction='row'
            spacing={2}
            justifyContent='center'
            flexWrap='wrap'
            sx={{ mt: 3 }}
            useFlexGap
          >
            {(props.localGameState.words || []).map((word: string) => (
              <Button
                key={word}
                variant='outlined'
                size='large'
                // onClick={() => props.handleWordSelect(word)}
                sx={{ minWidth: 120, mb: 1 }}
              >
                {word}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* DRAWING CANVAS - draw */}
      {props.action === "draw" && (
        <Box>
          <Alert severity='info' sx={{ mb: 2 }}>
            Draw: <strong>Nothing here</strong>
          </Alert>

          <DrawingCanvas />
        </Box>
      )}

      {/* GUESSING */}
      {props.action === "guess" && (
        <Box>
          <Typography variant='h6' gutterBottom>
            Guess the drawing:
          </Typography>

          <Box
            sx={{
              border: "2px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
            }}
          >
            Image here
            {/* <Image
              src={props.currentDrawing}
              alt='Current Drawing'
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            /> */}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              // value={props.guess}
              // onChange={(e) => props.setGuess(e.target.value)}
              placeholder='Type your guess...'
              fullWidth
              // onKeyDown={(e) => {
              //   if (e.key === "Enter") {
              //     props.handleSubmitGuess();
              //   }
              // }}
            />
            <Button
              variant='contained'
              // onClick={props.handleSubmitGuess}
              // disabled={!props.guess.trim() }
              sx={{ minWidth: 100 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}

      {/* WAITING (Other's Turn, No Drawing Yet) */}
      {props.action === "wait" && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant='h6' color='text.secondary'>
            Waiting for someone to draw...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default GameAreaInProgress;
