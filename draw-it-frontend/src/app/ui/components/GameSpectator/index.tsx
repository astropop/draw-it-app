// app/components/GameSpectator.tsx
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";
import { GameSpectatorDTO } from "@/app/types/game.type";
import { useEffect, useState } from "react";
import FinishedSpectator from "./FinishedSpectator";
import InProgressSpectator from "./InProgressSpectator";
import WaitingSpectator from "./WaitingSpectator";

export default function GameSpectator({
  initialData,
}: {
  initialData: GameSpectatorDTO;
}) {
  const [gameData, setGameData] = useState(initialData);
  const { players, currentDrawing, guesses, gameState } = useWebSocket(
    initialData.gameCode
  );

  useEffect(() => {
    if (players.length > 0) {
      setGameData((prev) => ({
        ...prev, // rest of previous state
        players:
          players.length > 0 ? [...prev.players, ...players] : prev.players, // update players if available
        // status: gameState.status || prev.status, // new status from response of WS
        // currentRound: gameState.currentRound || prev.currentRound, // new round from response of WS
        // maxRounds: gameState.maxRounds || prev.maxRounds, // usually not changing
      }));
    }
    console.log("gameState", gameState);
    console.log("players", players);
    console.log("gameData", gameData);
  }, [players, gameState, gameData]);

  if (gameData.status === "WAITING") {
    return <WaitingSpectator props={{ gameData }} />;
  }

  if (gameData.status === "IN_PROGRESS") {
    return (
      <InProgressSpectator props={{ gameData, currentDrawing, guesses }} />
    );
  }

  // FINISHED status
  return <FinishedSpectator props={{ gameData }} />;
}
