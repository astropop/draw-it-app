// app/components/GameSpectator.tsx
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";
import { GameSpectatorDTO, GameStatus } from "@/app/types/game.type";
import { useEffect, useMemo, useState } from "react";
import FinishedSpectator from "./FinishedSpectator";
import InProgressSpectator from "./InProgressSpectator";
import WaitingSpectator from "./WaitingSpectator";

export default function GameSpectator({
  initialData,
}: {
  initialData: GameSpectatorDTO;
}) {
  const { players } = useWebSocket(initialData.gameCode);

  // Derive a view of gameData that prefers live websocket players when available.
  const gameData = useMemo(() => {
    if (players && players.length > 0) {
      return { ...initialData, players } as GameSpectatorDTO;
    }
    return initialData;
  }, [initialData, players]);

  if (gameData.status === GameStatus.WAITING) {
    return <WaitingSpectator props={{ gameData }} />;
  }

  // if (gameData.status === GameStatus.IN_PROGRESS) {
  //   return (
  //     <InProgressSpectator props={{ gameData, currentDrawing, guesses }} />
  //   );
  // }

  // FINISHED status
  return <FinishedSpectator props={{ gameData }} />;
}
