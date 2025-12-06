"use client";
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
import { useEffect, useState } from "react";
import { SubmitDrawingRequestDto } from "@/app/lib/api/SubmitDrawing/type";
import { submitDrawing } from "@/app/lib/api/SubmitDrawing/fetcher";
import Image from "next/image";
import { SubmitGuessRequestDto } from "@/app/lib/api/SubmitGuess/type";
import { submitGuess } from "@/app/lib/api/SubmitGuess/fetcher";
import { SubmitGuessInput, submitGuessSchema } from "@/app/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getGame } from "@/app/lib/api/GetGame/fetcher";
import { useRouter } from "next/navigation";

export type GameAreaInProgressProps = {
  localGameState: GameResponseDto;
  action: string; // draw, guess, wait
  setLocalGameState: (data: GameResponseDto) => void;
  // selectedWord: string;
  // currentDrawing: string | null;
  // roundComplete: boolean;
  // showWarning: boolean;
  // warningMessage: string;

  // guess: string;
  // handleWordSelect?: (word: string) => void;
  // handleSubmitDrawing?: (imageData: string) => Promise<void>;
  // setGuess: (value: string) => void;
  // handleSubmitGuess: () => Promise<void>;
};

const GameAreaInProgress = ({ props }: { props: GameAreaInProgressProps }) => {
  /*
   * constants
   */
  const route = useRouter();
  /*
   * State management
   */
  const [wordSelected, setWordSelected] = useState<string>("");
  const [guessWrong, setGuessWrong] = useState<string>(); // wrong, corrected

  /*
   * functions
   */
  const handleSubmitDrawing = async (imageData: string) => {
    const gameCode = props.localGameState.gameCode;
    const submitData = {
      roundNumber: props.localGameState.currentRound,
      turnNumber: props.localGameState.currentTurnNumber,
      drawingData: imageData,
      selectedWord: wordSelected,
      drawingTime: 0, // TODO
    } as SubmitDrawingRequestDto;

    const response = await submitDrawing(gameCode, submitData);

    if (!response) {
      console.log("Error Submit Drawing");
      return;
    }
    route.refresh(); // refresh current page
    console.log("ok drawing", response.success);
  };

  const handleWordSelect = (word: string) => {
    if (confirm("Are you confirm to pick word : " + word)) {
      setWordSelected(word);
    }
  };

  const handleSubmitGuess = async (data: SubmitGuessInput) => {
    const gameCode = props.localGameState.gameCode;
    const submitData = {
      roundNumber: props.localGameState.currentRound,
      turnNumber: props.localGameState.currentTurnNumber,
      guess: data.guess,
      guessingTime: 10, // TODO
    } as SubmitGuessRequestDto;
    console.log("handleSubmitGuess", submitData);
    const response = await submitGuess(gameCode, submitData);

    if (!response) {
      console.log("Error Submit Guess");
      return;
    }

    if (!response.isCorrect) {
      setGuessWrong("wrong");
      return;
    }
    route.refresh();
  };

  /*
   * Hooks area
   */
  // verification for form
  const {
    register,
    handleSubmit,
    // watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<SubmitGuessInput>({
    // validate by zod
    resolver: zodResolver(submitGuessSchema),
    defaultValues: {
      guess: "",
    },
  });

  //

  return (
    <>
      {/* WORD SELECTION - draw */}
      {props.action === "draw" && !wordSelected && (
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
                onClick={() => handleWordSelect(word)}
                sx={{ minWidth: 120, mb: 1 }}
              >
                {word}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* DRAWING CANVAS - draw */}
      {props.action === "draw" && wordSelected && (
        <Box>
          <Alert severity='info' sx={{ mb: 2 }}>
            Draw: <strong>{wordSelected}</strong>
          </Alert>

          <DrawingCanvas handleSubmitDrawing={handleSubmitDrawing} />
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
            {props.localGameState.guessingImageData && (
              <Image
                src={props.localGameState.guessingImageData}
                alt={`Round ${props.localGameState.currentRound}`}
                style={{
                  display: "block",
                }}
                width={500}
                height={400}
              />
            )}
          </Box>

          <Box
            component='form'
            onSubmit={handleSubmit(handleSubmitGuess)}
            sx={{ display: "flex", gap: 2, flexDirection: "column" }}
          >
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
              {...register("guess")}
              error={!!errors.guess}
              disabled={isSubmitting || isLoading}
            />
            {errors.guess && (
              <Typography component='span' color='error' display={"block"}>
                {errors.guess.message}
              </Typography>
            )}
            {guessWrong && guessWrong === "wrong" && (
              <Typography component='span' color='warning' display={"block"}>
                Your guess is wrong. Please guess another word!
              </Typography>
            )}
            <Button
              variant='contained'
              // onClick={props.handleSubmitGuess}
              // disabled={!props.guess.trim() }
              sx={{ minWidth: 100 }}
              disabled={isSubmitting || isLoading}
              type='submit'
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
