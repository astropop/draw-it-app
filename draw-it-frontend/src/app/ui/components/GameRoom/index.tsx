// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { Card, CardContent, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";
import Players from "./LeftPanel/Players";
import StartButton from "./LeftPanel/StartButton";

type GameRoomProps = {
  gameData: GameResponseDto;
};

// Default constants

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  // State management
  const [currentPlayerSessionId, setCurrentPlayerSessionId] =
    useState<string>("");
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [localGameState, setLocalGameState] =
    useState<GameResponseDto>(gameData); // updateable game state

  // useefect
  // Initialize session from localStorage
  useEffect(() => {
    const sessionId =
      localStorage.getItem("playerSessionId") || gameData.playerSessionId;
    const nickname = localStorage.getItem("nickname") || "";

    setCurrentPlayerSessionId(sessionId);
    setCurrentNickname(nickname);
  }, []);

  // const area
  const isHost = gameData.isHost;

  // functions
  const handleKick = async (targetPlayerSessionId: string) => {
    // Call API kick player
  };

  const handleStartGame = async (currentPlayerSessionId: string) => {
    if (localGameState.players.length < 2) alert("Please wait another player");
    // Call API start game
  };

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
        <Grid sx={{ xs: 12, md: 3 }}>
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
          {/* Timer */}
          {/* {timerType && timeLeft > 0 && (
            <Timer props={{ timerType, timeLeft, localGameState }} />
          )} */}
          <br></br>
          Timer
        </Grid>

        {/* Middle Panel - Game Area */}
        <Grid sx={{ xs: 12, md: 6 }}>Middle Panel - Game Area</Grid>

        {/* Right Panel */}
        <Grid sx={{ xs: 12, md: 3 }}>
          {/* Guesses/Activity
          <Guesses guesses={guesses} /> */}
          <Instructions />
        </Grid>
      </Grid>
    </Container>
  );
}
