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
  currentPlayerSessionId: string;
  onSubmitDrawing: () => Promise<void>;
  onSubmitGuess: () => Promise<void>;
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
  const [isCorrectGuessing, setIsCorrectGuessing] = useState<boolean>(); // wrong, corrected
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [guessViewActive, setGuessViewActive] = useState(false);
  const [currentDrawingData, setCurrentDrawingData] = useState<string>("");
  const [isSubmittingToServer, setIsSubmittingToServer] =
    useState<boolean>(false);

  /*
   * functions
   */
  const handleSubmitDrawing = async (imageData: string) => {
    setIsSubmittingToServer(true);
    const gameCode = props.localGameState.gameCode;
    const submitData = {
      roundNumber: props.localGameState.currentRound,
      turnNumber: props.localGameState.currentTurnNumber,
      drawingData: imageData,
      selectedWord: wordSelected,
      drawingTimeLeft: timeLeft || 0,
    } as SubmitDrawingRequestDto;

    console.log("handleSubmitDrawing", submitData);

    const response = await submitDrawing(gameCode, submitData);

    if (!response) {
      console.log("Error Submit Drawing");
      setIsSubmittingToServer(false);
      return;
    }

    // Reset local state and refresh from server
    setWordSelected("");
    setTimerActive(false);
    setTimeLeft(0);
    setIsSubmittingToServer(false);
    // Call parent callback to refresh game state
    await props.onSubmitDrawing();

    console.log("ok drawing", response.success);
  };

  const handleWordSelect = (word: string) => {
    if (confirm("Are you confirm to pick word : " + word)) {
      setWordSelected(word);
    }
  };

  // Start drawing timer
  const handleStartDrawing = () => {
    setTimerActive(true);
    setTimeLeft(props.localGameState.drawingTime || 60);
  };

  // Start guessing timer and show image
  const handleStartGuessing = () => {
    setGuessViewActive(true);
    setTimerActive(true);
    setTimeLeft(props.localGameState.guessingTime || 30);
  };

  const handleSubmitGuess = async (data: SubmitGuessInput) => {
    setIsSubmittingToServer(true);
    const gameCode = props.localGameState.gameCode;
    const submitData = {
      roundNumber: props.localGameState.currentRound,
      turnNumber: props.localGameState.currentTurnNumber,
      guess: data.guess,
      guessingTimeLeft: timeLeft || 0,
    } as SubmitGuessRequestDto;
    console.log("handleSubmitGuess", submitData);

    const response = await submitGuess(gameCode, submitData);

    if (!response) {
      console.log("Error Submit Guess");
      setIsSubmittingToServer(false);
      return;
    }

    if (!response.isCorrect) {
      setIsCorrectGuessing(false);
      setIsSubmittingToServer(false);
      return;
    }

    // Reset and refresh game state
    setIsCorrectGuessing(undefined);
    setTimerActive(false);
    setTimeLeft(0);
    setGuessViewActive(false);
    setIsSubmittingToServer(false);

    // Call parent callback to refresh game state
    await props.onSubmitGuess();
    console.log("ok guess", response.isCorrect);
  };

  /*
   * Hooks area
   */

  // verification for form
  const {
    register,
    handleSubmit,
    watch,
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
  const formValues = {
    guess: watch("guess"),
  };

  // Countdown timer effect with auto-submit logic
  useEffect(() => {
    if (!timerActive || timeLeft <= 0 || isSubmittingToServer) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // When timer hits 0
        if (newTime <= 0) {
          setTimerActive(false);

          // Schedule auto-submit after render completes
          // Using setTimeout prevents setState-in-render error
          setTimeout(async () => {
            // Auto-submit based on action
            if (props.action === "draw" && wordSelected) {
              // Auto-submit drawing (even if empty)
              await handleSubmitDrawing(currentDrawingData);
            } else if (props.action === "guess") {
              // Auto-submit guess (even if empty)
              await handleSubmitGuess({ guess: formValues.guess });
            }
          }, 0);

          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timerActive,
    timeLeft,
    props.action,
    wordSelected,
    currentDrawingData,
    formValues.guess,
    props,
    handleSubmitDrawing,
    handleSubmitGuess,
  ]);
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
            {timerActive && (
              <Typography component='span' sx={{ ml: 2 }}>
                Time left: <strong>{timeLeft}s</strong>
              </Typography>
            )}
            {!timerActive && (
              <Button
                variant='contained'
                size='small'
                sx={{ ml: 2 }}
                onClick={handleStartDrawing}
              >
                Start Drawing
              </Button>
            )}
          </Alert>

          {timerActive && (
            <DrawingCanvas
              handleSubmitDrawing={handleSubmitDrawing}
              onDrawingUpdate={setCurrentDrawingData}
              isSubmittingToServer={isSubmittingToServer}
            />
          )}
        </Box>
      )}

      {/* GUESSING */}
      {props.action === "guess" && (
        <Box>
          <Typography variant='h6' gutterBottom>
            Guess the drawing:
          </Typography>

          {/* START GUESS BUTTON - show before guess view is active */}
          {!guessViewActive && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant='contained'
                size='large'
                onClick={handleStartGuessing}
              >
                Start Guess
              </Button>
            </Box>
          )}

          {/* DRAWING AND GUESS FORM - show after Start Guess is clicked */}
          {guessViewActive && (
            <>
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

              <Alert severity={timerActive ? "info" : "warning"} sx={{ mb: 2 }}>
                {timerActive && (
                  <Typography component='span'>
                    Time left: <strong>{timeLeft}s</strong>
                  </Typography>
                )}
              </Alert>

              <Box
                component='form'
                onSubmit={handleSubmit(handleSubmitGuess)}
                sx={{ display: "flex", gap: 2, flexDirection: "column" }}
              >
                <TextField
                  placeholder='Type your guess...'
                  fullWidth
                  {...register("guess")}
                  error={!!errors.guess}
                  disabled={isSubmitting || isLoading}
                />
                {errors.guess && (
                  <Typography component='span' color='error' display={"block"}>
                    {errors.guess.message}
                  </Typography>
                )}
                {isCorrectGuessing === false && (
                  <Typography
                    component='span'
                    color='warning'
                    display={"block"}
                  >
                    Your guess is wrong. Please guess another word!
                  </Typography>
                )}
                <Button
                  variant='contained'
                  sx={{ minWidth: 100 }}
                  disabled={isSubmitting || isLoading}
                  type='submit'
                >
                  Submit
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* WAITING */}
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
