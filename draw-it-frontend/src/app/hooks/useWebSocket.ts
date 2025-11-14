// app/hooks/useWebSocket.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

export interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket(gameCode: string | null) {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [currentDrawing, setCurrentDrawing] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<any[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!gameCode) return;

    const socket = new SockJS(process.env.NEXT_PUBLIC_WS_URL!);
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);

        // Subscribe to player updates
        stompClient.subscribe(
          `/topic/game/${gameCode}/players`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            handlePlayerUpdate(data);
          }
        );

        // Subscribe to drawing updates
        stompClient.subscribe(
          `/topic/game/${gameCode}/drawing`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            handleDrawingUpdate(data);
          }
        );

        // Subscribe to guess updates
        stompClient.subscribe(
          `/topic/game/${gameCode}/guess`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            handleGuessUpdate(data);
          }
        );

        // Subscribe to game state changes
        stompClient.subscribe(
          `/topic/game/${gameCode}/state`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            handleGameStateChange(data);
          }
        );

        // Subscribe to personal kick notifications
        stompClient.subscribe(`/user/queue/kick`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          handleKicked(data);
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [gameCode]);

  const handlePlayerUpdate = (data: any) => {
    if (data.type === "PLAYER_JOINED") {
      setPlayers((prev) => [
        ...prev,
        {
          nickname: data.nickname,
          sessionId: data.sessionId,
          score: 0,
        },
      ]);
    } else if (Array.isArray(data.players)) {
      setPlayers(data.players);
    }
  };

  const handleDrawingUpdate = (data: any) => {
    setCurrentDrawing(data.drawingData);
    if (data.containsKeyword) {
      alert(`⚠️ WARNING: ${data.drawer}'s drawing contains keyword text!`);
    }
  };

  const handleGuessUpdate = (data: any) => {
    setGuesses((prev) => [...prev, data]);

    // Update player score
    setPlayers((prev) =>
      prev.map((p) =>
        p.nickname === data.playerNickname
          ? { ...p, score: p.score + (data.pointsEarned || 0) }
          : p
      )
    );
  };

  const handleGameStateChange = (data: any) => {
    setGameState(data);

    if (data.type === "NEXT_ROUND") {
      setCurrentDrawing(null);
      setGuesses([]);
    } else if (data.type === "GAME_FINISHED") {
      alert("🎉 Game finished!");
    }
  };

  const handleKicked = (data: any) => {
    alert(`You have been kicked: ${data.reason}`);
    window.location.href = "/";
  };

  const kickPlayer = useCallback(
    (targetSessionId: string) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/game/${gameCode}/kick`,
          body: JSON.stringify({ targetSessionId }),
        });
      }
    },
    [gameCode]
  );

  const sendDrawing = useCallback(
    (drawingData: string) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/game/${gameCode}/drawing-submitted`,
          body: JSON.stringify({ drawingData }),
        });
      }
    },
    [gameCode]
  );

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
