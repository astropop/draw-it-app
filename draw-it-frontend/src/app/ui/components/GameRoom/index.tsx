"use client";

import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { Card, CardContent, Container, Grid, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import GameAreaInProgress from "./GameArea/GameAreaInProgress";
import GameAreaWaiting from "./GameArea/GameAreaWaiting";
import Players from "./LeftPanel/Players";
import StartButton from "./LeftPanel/StartButton";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";
import { getGame } from "@/app/lib/api/GetGame/fetcher";
import { startGame } from "@/app/lib/api/StartGame/fetcher";
import { useRouter } from "next/navigation";

type GameRoomProps = {
  gameData: GameResponseDto;
};

// Default constants

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  /*
   * State management
   */

  const [localGameState, setLocalGameState] =
    useState<GameResponseDto>(gameData); // updateable game state
  // const currentNickname = localStorage.getItem("nickname") || "";
  const [currentNickname, setCurrentNickname] = useState<string>("");
  /*
   * constants area
   */
  const currentPlayerSessionId = gameData.playerSessionId;
  const isHost = localGameState.isHost;
  const route = useRouter();
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

  useEffect(() => {
    const nickname = localStorage.getItem("nickname");

    if (nickname) {
      setCurrentNickname(nickname);
    }
  }, [gameData.gameCode]);
  // redirect page after game is finished
  useEffect(() => {
    if (localGameState.status === GameStatus.FINISHED) {
      route.replace(`/spectate/${localGameState.gameCode}`); // user cannot go back
    }
  }, [localGameState.status, localGameState.gameCode, route]);

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <RoomHeader
        currentNickname={currentNickname}
        localGameState={localGameState}
      />

      {/* Main Content */}
      <Grid container spacing={2}>
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
        </Grid>

        {/* Middle Panel - Game Area */}
        <Grid sx={{ xs: 12, md: 10 }} size='grow'>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
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
                      onSubmitDrawingCallback: refreshGameState,
                      onSubmitGuessCallback: refreshGameState,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
