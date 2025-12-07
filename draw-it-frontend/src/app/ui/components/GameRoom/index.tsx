"use client";

import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { Card, CardContent, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import GameAreaInProgress from "./GameArea/GameAreaInProgress";
import GameAreaWaiting from "./GameArea/GameAreaWaiting";
import Players from "./LeftPanel/Players";
import StartButton from "./LeftPanel/StartButton";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";
import { getGame } from "@/app/lib/api/GetGame/fetcher";
import { startGame } from "@/app/lib/api/StartGame/fetcher";

type GameRoomProps = {
  gameData: GameResponseDto;
};

// Default constants

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  /*
   * constants area
   */
  const isHost = gameData.isHost;
  /*
   * State management
   */
  const [currentPlayerSessionId, setCurrentPlayerSessionId] =
    useState<string>("");
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [localGameState, setLocalGameState] =
    useState<GameResponseDto>(gameData); // updateable game state

  /*
   * functions
   */
  const handleKick = async (targetPlayerSessionId: string) => {
    // Call API kick player
  };

  const handleStartGame = async () => {
    if (localGameState.players.length < 2) {
      alert("Please wait another player");
      return;
    }
    // Call API start game
    try {
      const updated = await startGame(gameData.gameCode);
      if (updated) {
        setLocalGameState(updated);
      }
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  // Refresh game state from API
  const refreshGameState = async () => {
    try {
      const updated = await getGame(gameData.gameCode);
      if (updated) {
        setLocalGameState(updated);
      }
    } catch (err) {
      console.error("Failed to refresh game state:", err);
    }
  };

  /*
   * Hooks area
   */
  // Initialize session from localStorage
  useEffect(() => {
    const sessionId =
      localStorage.getItem("playerSessionId") || gameData.playerSessionId;
    const nickname = localStorage.getItem("nickname") || "";

    setCurrentPlayerSessionId(sessionId);
    setCurrentNickname(nickname);
  }, []);

  // Auto-refresh game state when in progress (every 3 seconds)
  // useEffect(() => {
  //   if (localGameState.status !== GameStatus.IN_PROGRESS) return;

  //   const interval = setInterval(() => {
  //     refreshGameState();
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [localGameState.status, gameData.gameCode, currentPlayerSessionId]);
  //

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <RoomHeader
        currentNickname={currentNickname}
        localGameState={localGameState}
      />

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Panel - Players */}
        <Grid sx={{ xs: 12, md: 2 }}>
          <Card>
            <CardContent>
              {/* Players  */}
              <Players
                props={{
                  localGameState,
                  isHost,
                  handleKick,
                  currentPlayerSessionId,
                }}
              />

              {/* START BUTTON - Only for host in WAITING status */}
              {isHost && localGameState.status === GameStatus.WAITING && (
                <StartButton
                  props={{
                    localGameState,
                    handleStartGame,
                    currentPlayerSessionId,
                  }}
                />
              )}
            </CardContent>
          </Card>
          <Instructions />
          <br></br>
          Timer
        </Grid>

        {/* Middle Panel - Game Area */}
        <Grid sx={{ xs: 12, md: 10 }}>
          {localGameState.status === GameStatus.WAITING && (
            <GameAreaWaiting props={{ localGameState, isHost }} />
          )}

          {localGameState.status === GameStatus.IN_PROGRESS && (
            <GameAreaInProgress
              props={{
                localGameState,
                action: localGameState.action,
                setLocalGameState,
                currentPlayerSessionId,
                onSubmitDrawing: refreshGameState,
                onSubmitGuess: refreshGameState,
              }}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
