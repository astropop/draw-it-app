// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { GameResponseDto, GameStatus } from "@/app/lib/game.type";
import { Card, CardContent, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";

type GameRoomProps = {
  gameData: GameResponseDto;
};

// Default constants

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  // State management
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [localGameState, setLocalGameState] =
    useState<GameResponseDto>(gameData); // updateable game state

  // Initialize session from localStorage
  useEffect(() => {
    const sessionId =
      localStorage.getItem("playerSessionId") || gameData.playerSessionId;
    const nickname = localStorage.getItem("nickname") || "";

    setCurrentSessionId(sessionId);
    setCurrentNickname(nickname);
  }, []);

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
              {/* <Players
                props={{
                  currentPlayers,
                  localGameState,
                  isHost,
                  handleKick,
                  isMyTurn,
                  currentSessionId,
                }}
              /> */}
              Player list
              <br></br>
              Start button
              {/* START BUTTON - Only for host in WAITING status */}
              {/* {isHost && localGameState.status === GameStatus.WAITING && (
                <StartButton props={{ currentPlayers, handleStartGame }} />
              )} */}
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
