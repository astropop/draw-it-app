"use client";
import { submitDrawing } from "@/app/lib/api/SubmitDrawing/fetcher";
import { SubmitDrawingRequestDto } from "@/app/lib/api/SubmitDrawing/type";
import { submitGuess } from "@/app/lib/api/SubmitGuess/fetcher";
import { SubmitGuessRequestDto } from "@/app/lib/api/SubmitGuess/type";
import { GameResponseDto } from "@/app/lib/game.type";
import { SubmitGuessInput, submitGuessSchema } from "@/app/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DrawingCanvas from "../_component/DrawingCanvas";

export type GameAreaInProgressProps = {
  localGameState: GameResponseDto;
  action: string; // draw, guess, wait
  setLocalGameState: (data: GameResponseDto) => void;
  currentPlayerSessionId: string;
  onSubmitDrawingCallback: () => Promise<void>; // callback function from parent component
  onSubmitGuessCallback: () => Promise<void>; // callback function from parent component
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
    console.log("ok drawing", response.success);
    await props.onSubmitDrawingCallback();
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

    if (!response && timeLeft > 0) {
      console.log("Error Submit Guess");
      setIsSubmittingToServer(false);
      return;
    }

    if (!response.isCorrect && timeLeft > 0) {
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
    console.log("ok guess", response.isCorrect);
    await props.onSubmitGuessCallback();
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
    if (!timerActive || isSubmittingToServer) return;

    const interval = setInterval(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime); // count down by 1 sec
      if (timeLeft <= 0) {
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
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isSubmittingToServer]);

  return (
    <>
      {/* WORD SELECTION - draw */}
      {props.action === "draw" && !wordSelected && (
        <Box sx={{ textAlign: "center", height: "100%" }}>
          <Typography variant='h5' gutterBottom>
            Choose a word to draw:
          </Typography>
          <Grid container spacing={1} columns={{ xs: 4, sm: 8, md: 12 }}>
            {(props.localGameState.words || []).map((word: string) => (
              <Grid key={word} size={{ xs: 2, sm: 2, md: 2 }}>
                <Button
                  key={word}
                  variant='outlined'
                  size='large'
                  onClick={() => handleWordSelect(word)}
                  sx={{ minWidth: 120, mb: 1 }}
                >
                  {word}
                </Button>
              </Grid>
            ))}
          </Grid>
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
        <Box
          sx={{
            textAlign: "center",
            justifyItems: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
                  width: 500,
                  height: 400,
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
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: "column",
                  width: 500,
                }}
              >
                <TextField
                  placeholder='Type your guess...'
                  fullWidth
                  {...register("guess")}
                  error={!!errors.guess}
                  disabled={isSubmitting || isLoading}
                  sx={{ width: "500" }}
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
        <Box sx={{ textAlign: "center", py: 8, height: "100%" }}>
          <Typography variant='h6' color='text.secondary'>
            Waiting for someone to draw...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default GameAreaInProgress;
