// app/components/GameSpectator.tsx
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";
import { GameSpectatorDTO } from "@/app/lib/game.type";
import { useState } from "react";
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
