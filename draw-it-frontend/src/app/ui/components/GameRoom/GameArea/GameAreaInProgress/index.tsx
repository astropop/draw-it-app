import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import DrawingCanvas from "../../../DrawingCanvas";
import { GameResponseDTO } from "@/app/types/game.type";
import Image from "next/image";

export type GameAreaInProgressProps = {
  localGameState: GameResponseDTO;
  isMyTurn: boolean;
  selectedWord: string;
  currentDrawing: string | null;
  roundComplete: boolean;
  showWarning: boolean;
  warningMessage: string;
  handleWordSelect: (word: string) => void;
  handleSubmitDrawing: (imageData: string) => Promise<void>;
  guess: string;
  setGuess: (value: string) => void;
  handleSubmitGuess: () => Promise<void>;
};

const GameAreaInProgress = ({ props }: { props: GameAreaInProgressProps }) => {
  return (
    <>
      {/* WORD SELECTION (My Turn, No Word Selected) */}
      {props.isMyTurn && !props.selectedWord && (
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
                onClick={() => props.handleWordSelect(word)}
                sx={{ minWidth: 120, mb: 1 }}
              >
                {word}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* DRAWING CANVAS (My Turn, Word Selected) */}
      {props.isMyTurn && props.selectedWord && (
        <Box>
          <Alert severity='info' sx={{ mb: 2 }}>
            Draw: <strong>{props.selectedWord}</strong>
          </Alert>

          {props.showWarning && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {props.warningMessage}
            </Alert>
          )}

          <DrawingCanvas
            selectedWord={props.selectedWord}
            onSubmit={props.handleSubmitDrawing}
            timeLimit={props.localGameState.drawingTime!}
          />
        </Box>
      )}

      {/* GUESSING (Other's Turn, Drawing Shown) */}
      {!props.isMyTurn && props.currentDrawing && (
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
            <Image
              src={props.currentDrawing}
              alt='Current Drawing'
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </Box>

          {!props.roundComplete && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                value={props.guess}
                onChange={(e) => props.setGuess(e.target.value)}
                placeholder='Type your guess...'
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    props.handleSubmitGuess();
                  }
                }}
                disabled={props.roundComplete}
              />
              <Button
                variant='contained'
                onClick={props.handleSubmitGuess}
                disabled={!props.guess.trim() || props.roundComplete}
                sx={{ minWidth: 100 }}
              >
                Submit
              </Button>
            </Box>
          )}

          {props.roundComplete && (
            <Alert severity='success'>
              ✓ Your answer has been submitted! Waiting for others...
            </Alert>
          )}
        </Box>
      )}

      {/* WAITING (Other's Turn, No Drawing Yet) */}
      {!props.isMyTurn && !props.currentDrawing && (
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
