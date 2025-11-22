// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";
import { useMockWebSocket } from "@/app/hooks/useWebSocket.mock";
import { gameApi } from "@/app/lib/api";
import { GameResponseDTO, GameStatus } from "@/app/types/game.type";
import { Card, CardContent, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import GameArea from "./GameArea";
import Players from "./LeftPanel/Players";
import StartButton from "./LeftPanel/StartButton";
import Timer from "./LeftPanel/Timer";
import Guesses from "./RightPanel/Guesses";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";

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
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [guess, setGuess] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [localGameState, setLocalGameState] =
    useState<GameResponseDTO>(initialGameState);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerType, setTimerType] = useState<"drawing" | "guessing" | null>(
    null
  );
  const [roundComplete, setRoundComplete] = useState(false);
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

  // Initialize session from localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId") || gameData.sessionId;
    const nickname = localStorage.getItem("nickname") || "";

    setCurrentSessionId(sessionId);
    setCurrentNickname(nickname);
    setLocalGameState(initialGameState);

    console.log("GameRoom initialized:", {
      sessionId,
      nickname,
      gameCode: gameData.gameCode,
      status: gameData.status,
      isHost: gameData.isHost,
    });
  }, [gameData]);

  // Check if current user is host
  useEffect(() => {
    // Use gameData.isHost if available
    if (gameData.isHost !== undefined) {
      setIsHost(gameData.isHost);
      return;
    }

    // Fallback: check from players list
    if (players.length > 0 && currentSessionId) {
      const currentPlayer = players.find(
        (p) => p.sessionId === currentSessionId
      );
      setIsHost(currentPlayer?.isHost ?? false);
    } else if (gameData.players?.length > 0 && currentSessionId) {
      const currentPlayer = gameData.players.find(
        (p) => p.sessionId === currentSessionId
      );
      setIsHost(currentPlayer?.isHost ?? false);
    }
  }, [players, currentSessionId, gameData.isHost, gameData.players]);

  // Determine whose turn it is
  useEffect(() => {
    if (localGameState.status === GameStatus.IN_PROGRESS) {
      const myTurn = localGameState.currentDrawerSessionId === currentSessionId;
      setIsMyTurn(myTurn);
    }
  }, [
    localGameState.status,
    localGameState.currentDrawerSessionId,
    currentSessionId,
  ]);

  // Update game state from WebSocket
  useEffect(() => {
    if (gameState) {
      setLocalGameState((prev) => ({
        ...prev,
        status: gameState.status || prev.status,
        currentRound: gameState.currentRound || prev.currentRound,
        maxRounds: gameState.maxRounds || prev.maxRounds,
      }));

      if (
        gameState.type === "GAME_STARTED" ||
        gameState.type === "NEXT_ROUND"
      ) {
        setSelectedWord("");
        setGuess("");
        setShowWarning(false);
        setRoundComplete(false);

        const myTurn = gameState.currentDrawer === currentNickname;
        setIsMyTurn(myTurn);

        if (myTurn) {
          setTimerType("drawing");
          setTimeLeft(localGameState.drawingTime ?? DEFAULT_DRAWING_TIME);
        }
      } else if (gameState.type === "GAME_FINISHED") {
        alert("Game finished! Check the results.");
        window.location.href = `/spectate/${gameData.gameCode}`;
      }
    }
  }, [
    gameState,
    currentNickname,
    localGameState.drawingTime,
    gameData.gameCode,
  ]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && timerType) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerType === "drawing" && selectedWord && isMyTurn) {
              handleAutoSubmitDrawing();
            } else if (timerType === "guessing" && !roundComplete) {
              handleAutoSubmitGuess();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, timerType, selectedWord, isMyTurn, roundComplete]);

  // Start guessing timer when drawing is submitted
  useEffect(() => {
    if (currentDrawing && !isMyTurn && !roundComplete) {
      setTimerType("guessing");
      setTimeLeft(localGameState.guessingTime ?? DEFAULT_GUESSING_TIME);
    }
  }, [currentDrawing, isMyTurn, localGameState.guessingTime, roundComplete]);

  // Handle functions
  const handleStartGame = async () => {
    try {
      await gameApi.startGame(gameData.gameCode);
      console.log("Game started");
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    console.log("Word selected:", word);
  };

  const handleSubmitDrawing = async (imageData: string) => {
    if (!selectedWord) {
      alert("Please select a word first!");
      return;
    }

    try {
      const response = await gameApi.submitDrawing({
        roundId: currentRoundId ?? 1, // Mock round ID
        drawingData: imageData,
        selectedWord: selectedWord,
      });

      if (response.containsKeyword) {
        setShowWarning(true);
        setWarningMessage(
          response.warning || "Your drawing contains the keyword text!"
        );
      }

      sendDrawing(imageData);
      setTimerType(null);
      setTimeLeft(0);
      console.log("Drawing submitted");
    } catch (error) {
      console.error("Failed to submit drawing:", error);
      alert("Failed to submit drawing. Please try again.");
    }
  };

  const handleAutoSubmitDrawing = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      handleSubmitDrawing(imageData);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim()) {
      alert("Please enter your guess!");
      return;
    }

    try {
      await gameApi.submitGuess({
        roundId: currentRoundId ?? 1,
        guess: guess.trim(),
      });

      setGuess("");
      setRoundComplete(true);
      setTimerType(null);
      setTimeLeft(0);
      console.log("Guess submitted:", guess);
    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
    }
  };

  const handleAutoSubmitGuess = () => {
    if (guess.trim()) {
      handleSubmitGuess();
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
        props={{ gameData, localGameState, currentNickname, isHost }}
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
                  currentSessionId,
                }}
              />

              {/* START BUTTON - Only for host in WAITING status */}
              {isHost && localGameState.status === GameStatus.WAITING && (
                <StartButton props={{ currentPlayers, handleStartGame }} />
              )}
            </CardContent>
          </Card>

          {/* Timer */}
          {timerType && timeLeft > 0 && (
            <Timer props={{ timerType, timeLeft, localGameState }} />
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
                  selectedWord,
                  localGameState,
                  handleWordSelect,
                  currentDrawing,
                  roundComplete,
                  showWarning,
                  warningMessage,
                  handleSubmitDrawing,
                  guess,
                  setGuess,
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
