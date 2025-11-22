// app/hooks/useWebSocket.mock.ts - COMPLETE VERSION

import { useEffect, useState } from "react";
import {
  GameStateMessage,
  GuessSubmittedMessage,
  PlayerDTO,
} from "../types/game.type";

export function useMockWebSocket(gameCode: string | null) {
  const [connected] = useState(true);
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [gameState, setGameState] = useState<GameStateMessage | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<GuessSubmittedMessage[]>([]);

  useEffect(() => {
    if (!gameCode) return;

    console.log("Mock WebSocket connected for:", gameCode);

    // Simulate connection delay
    setTimeout(() => {
      if (gameCode === "PLAY5678") {
        // IN_PROGRESS game mock
        setGameState({
          type: "GAME_STARTED",
          gameCode: "PLAY5678",
          currentRound: 2,
          maxRounds: 5,
          currentDrawer: "Liam",
        });

        // For GUESSING scenario, show drawing after 500ms
        setTimeout(() => {
          setCurrentDrawing(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
          );

          // Add mock guesses
          setGuesses([
            {
              roundId: 2,
              playerNickname: "Emma",
              guess: "pizza",
              isCorrect: true,
              pointsEarned: 95,
            },
            {
              roundId: 2,
              playerNickname: "Olivia",
              guess: "sushi",
              isCorrect: false,
              pointsEarned: 0,
            },
          ]);
        }, 500);
      }
    }, 100);

    return () => {
      console.log("Mock WebSocket disconnected");
    };
  }, [gameCode]);

  const kickPlayer = (sessionId: string) => {
    console.log("Mock: Kick player", sessionId);
  };

  const sendDrawing = (data: string) => {
    console.log("Mock: Drawing sent");
    setCurrentDrawing(data);
  };

  return {
    connected,
    players,
    gameState,
    currentDrawing,
    guesses,
    kickPlayer,
    sendDrawing,
  };
}
