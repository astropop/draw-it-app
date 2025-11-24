// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";
import { useMockWebSocket } from "@/app/hooks/useWebSocket.mock";

import { startGame, submitDrawing, submitGuess } from "@/app/lib/api";
import { GameResponseDTO, GameStatus } from "@/app/types/game.type";
import { Card, CardContent, Container, Grid } from "@mui/material";
import { useEffect, useRef, useReducer, useMemo, useState } from "react";
import GameArea from "./GameArea";
import Players from "./LeftPanel/Players";
import StartButton from "./LeftPanel/StartButton";
import Timer from "./LeftPanel/Timer";
import Guesses from "./RightPanel/Guesses";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";
import useTimer, { TimerType } from "@/app/hooks/useTimer";

interface GameRoomProps {
  gameData: GameResponseDTO;
}

// Default constants
const DEFAULT_DRAWING_TIME = 120;
const DEFAULT_GUESSING_TIME = 60;
const DEFAULT_MAX_ROUNDS = 3;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  // Ensure defaults are set
  const initialGameState: GameResponseDTO = {
    ...gameData,
    drawingTime: gameData.drawingTime ?? DEFAULT_DRAWING_TIME,
    guessingTime: gameData.guessingTime ?? DEFAULT_GUESSING_TIME,
    maxRounds: gameData.maxRounds ?? DEFAULT_MAX_ROUNDS,
  };

  // State management
  // Replace many small useState with refs/reducer and a timer hook
  const currentSessionIdRef = useRef<string>("");
  const currentNicknameRef = useRef<string>("");

  // Local game state (kept) — updated from WS
  const [localGameState, setLocalGameState] =
    useState<GameResponseDTO>(initialGameState);

  // UI reducer to group related UI state
  type UIState = {
    selectedWord: string;
    guess: string;
    showWarning: boolean;
    warningMessage: string;
    currentRoundId: number | null;
    roundComplete: boolean;
  };

  const initialUIState: UIState = {
    selectedWord: "",
    guess: "",
    showWarning: false,
    warningMessage: "",
    currentRoundId: null,
    roundComplete: false,
  };

  type UIAction =
    | { type: "SELECT_WORD"; payload: string }
    | { type: "SET_GUESS"; payload: string }
    | { type: "SHOW_WARNING"; payload?: string }
    | { type: "CLEAR_WARNING" }
    | { type: "SET_ROUND_COMPLETE"; payload: boolean }
    | { type: "SET_ROUND_ID"; payload: number | null }
    | { type: "RESET_FOR_NEW_ROUND" };

  function uiReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
      case "SELECT_WORD":
        return { ...state, selectedWord: action.payload };
      case "SET_GUESS":
        return { ...state, guess: action.payload };
      case "SHOW_WARNING":
        return {
          ...state,
          showWarning: true,
          warningMessage: action.payload ?? "",
        };
      case "CLEAR_WARNING":
        return { ...state, showWarning: false, warningMessage: "" };
      case "SET_ROUND_COMPLETE":
        return { ...state, roundComplete: action.payload };
      case "SET_ROUND_ID":
        return { ...state, currentRoundId: action.payload };
      case "RESET_FOR_NEW_ROUND":
        return {
          ...state,
          selectedWord: "",
          guess: "",
          showWarning: false,
          warningMessage: "",
          roundComplete: false,
        };
      default:
        return state;
    }
  }

  const [uiState, dispatchUI] = useReducer(uiReducer, initialUIState);

  const websocketHook = USE_MOCK ? useMockWebSocket : useWebSocket;
  // WebSocket connection
  const {
    connected,
    players,
    gameState,
    currentDrawing,
    guesses,
    kickPlayer,
    sendDrawing,
  } = websocketHook(gameData.gameCode);

  // derive host from gameData or players list
  const isHost = useMemo(() => {
    if (gameData.isHost !== undefined) return gameData.isHost;
    const sid = currentSessionIdRef.current;
    if (!sid) return false;
    const fromPlayers = players.find((p) => p.sessionId === sid);
    if (fromPlayers) return fromPlayers.isHost ?? false;
    const fromGame = gameData.players?.find((p) => p.sessionId === sid);
    return fromGame?.isHost ?? false;
  }, [gameData.isHost, players, gameData.players]);

  const isMyTurn = useMemo(() => {
    return (
      localGameState.status === GameStatus.IN_PROGRESS &&
      localGameState.currentDrawerSessionId === currentSessionIdRef.current
    );
  }, [localGameState.status, localGameState.currentDrawerSessionId]);

  // timer hook — centralize timer logic
  const onTimerExpire = (type: TimerType) => {
    if (type === "drawing") {
      if (uiState.selectedWord && isMyTurn) {
        const canvas = document.querySelector("canvas");
        if (canvas) {
          const imageData = (canvas as HTMLCanvasElement).toDataURL(
            "image/png"
          );
          void handleSubmitDrawing(imageData);
        }
      }
    } else if (type === "guessing") {
      if (!uiState.roundComplete && uiState.guess.trim()) {
        void handleSubmitGuess();
      }
    }
  };

  const {
    timeLeft,
    running,
    start: startTimer,
    stop: stopTimer,
    currentType,
  } = useTimer(onTimerExpire);

  // Initialize session from localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId") || gameData.sessionId;
    const nickname = localStorage.getItem("nickname") || "";

    currentSessionIdRef.current = sessionId;
    currentNicknameRef.current = nickname;
    setLocalGameState(initialGameState);

    console.log("GameRoom initialized:", {
      sessionId,
      nickname,
      gameCode: gameData.gameCode,
      status: gameData.status,
      isHost: gameData.isHost,
    });
  }, [gameData]);

  // Update game state from WebSocket
  useEffect(() => {
    // gameState from websocket, check and update in realtime
    if (gameState) {
      setLocalGameState((prev) => ({
        ...prev, // rest of previous state
        status: gameState.status || prev.status, // new status from response of WS
        currentRound: gameState.currentRound || prev.currentRound, // new round from response of WS
        // maxRounds: gameState.maxRounds || prev.maxRounds, // usually not changing
      }));

      if (
        gameState.type === "GAME_STARTED" ||
        gameState.type === "NEXT_ROUND"
      ) {
        dispatchUI({ type: "RESET_FOR_NEW_ROUND" });
        dispatchUI({
          type: "SET_ROUND_ID",
          payload: gameState.currentRound ?? 1,
        });

        const myTurn = gameState.currentDrawer === currentNicknameRef.current;

        if (myTurn) {
          startTimer(
            "drawing",
            localGameState.drawingTime ?? DEFAULT_DRAWING_TIME
          );
        } else {
          // ensure timer stopped for others
          stopTimer();
        }
      } else if (gameState.type === "GAME_FINISHED") {
        alert("Game finished! Check the results.");
        window.location.href = `/spectate/${gameData.gameCode}`;
      }
    }
  }, [gameState, localGameState.drawingTime, gameData.gameCode]);

  // Start guessing timer when drawing is submitted
  useEffect(() => {
    if (currentDrawing && !isMyTurn && !uiState.roundComplete) {
      startTimer(
        "guessing",
        localGameState.guessingTime ?? DEFAULT_GUESSING_TIME
      );
    }
  }, [
    currentDrawing,
    isMyTurn,
    localGameState.guessingTime,
    uiState.roundComplete,
  ]);

  // Handle functions
  const handleStartGame = async () => {
    try {
      await startGame(gameData.gameCode);
      console.log("Game started");
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  const handleWordSelect = (word: string) => {
    dispatchUI({ type: "SELECT_WORD", payload: word });
    console.log("Word selected:", word);
  };

  const handleSubmitDrawing = async (imageData: string) => {
    if (!uiState.selectedWord) {
      alert("Please select a word first!");
      return;
    }

    try {
      const response = await submitDrawing({
        roundId: uiState.currentRoundId ?? 1,
        drawingData: imageData,
        selectedWord: uiState.selectedWord,
      });

      if (response?.containsKeyword) {
        dispatchUI({ type: "SHOW_WARNING", payload: response.warning });
      }

      sendDrawing(imageData);
      stopTimer();
      console.log("Drawing submitted");
    } catch (error) {
      console.error("Failed to submit drawing:", error);
      alert("Failed to submit drawing. Please try again.");
    }
  };

  const handleAutoSubmitDrawing = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const imageData = (canvas as HTMLCanvasElement).toDataURL("image/png");
      void handleSubmitDrawing(imageData);
    }
  };

  const handleSubmitGuess = async () => {
    if (!uiState.guess.trim()) {
      alert("Please enter your guess!");
      return;
    }

    try {
      await submitGuess({
        roundId: uiState.currentRoundId ?? 1,
        guess: uiState.guess.trim(),
      });

      dispatchUI({ type: "SET_GUESS", payload: "" });
      dispatchUI({ type: "SET_ROUND_COMPLETE", payload: true });
      stopTimer();
      console.log("Guess submitted:", uiState.guess);
    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
    }
  };

  const handleAutoSubmitGuess = () => {
    if (uiState.guess.trim()) {
      void handleSubmitGuess();
    }
  };

  const handleKick = (targetSessionId: string) => {
    if (window.confirm("Are you sure you want to kick this player?")) {
      kickPlayer(targetSessionId);
    }
  };

  // Get current player list
  const currentPlayers =
    players.length > 0 ? players : localGameState.players || [];

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <RoomHeader
        props={{
          gameData,
          localGameState,
          currentNickname: currentNicknameRef.current,
          isHost,
          connected,
        }}
      />

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Panel - Players */}
        <Grid sx={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              {/* Players  */}
              <Players
                props={{
                  currentPlayers,
                  localGameState,
                  isHost,
                  handleKick,
                  isMyTurn,
                  currentSessionId: currentSessionIdRef.current,
                }}
              />

              {/* START BUTTON - Only for host in WAITING status */}
              {isHost && localGameState.status === GameStatus.WAITING && (
                <StartButton props={{ currentPlayers, handleStartGame }} />
              )}
            </CardContent>
          </Card>

          {/* Timer */}
          {currentType && timeLeft > 0 && (
            <Timer
              props={{ timerType: currentType, timeLeft, localGameState }}
            />
          )}
        </Grid>

        {/* Middle Panel - Game Area */}
        <Grid sx={{ xs: 12, md: 6 }}>
          {/* WAITING STATE */}
          {localGameState.status === GameStatus.WAITING && (
            <GameArea
              props={{
                waitingprops: {
                  localGameState,
                  isHost,
                  currentPlayers,
                },
              }}
            />
          )}

          {/* IN PROGRESS STATE */}
          {localGameState.status === GameStatus.IN_PROGRESS && (
            <GameArea
              props={{
                inprogprops: {
                  isMyTurn,
                  selectedWord: uiState.selectedWord,
                  localGameState,
                  handleWordSelect,
                  currentDrawing,
                  roundComplete: uiState.roundComplete,
                  showWarning: uiState.showWarning,
                  warningMessage: uiState.warningMessage,
                  handleSubmitDrawing,
                  guess: uiState.guess,
                  setGuess: (v: string) =>
                    dispatchUI({ type: "SET_GUESS", payload: v }),
                  handleSubmitGuess,
                },
              }}
            />
          )}
        </Grid>

        {/* Right Panel */}
        <Grid sx={{ xs: 12, md: 3 }}>
          {/* Guesses/Activity */}
          <Guesses guesses={guesses} />

          {/* Instructions */}
          {localGameState.status === GameStatus.WAITING && <Instructions />}
        </Grid>
      </Grid>
    </Container>
  );
}
