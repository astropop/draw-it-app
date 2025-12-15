"use client";

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { KickPlayerResponseDto } from "../lib/websocket/websocket.type";

export function useWebSocket(
  gameCode?: string | null,
  currentPlayerSessionId?: string | null
) {
  /*
   * constants
   */

  /*
   * State management
   */
  const [connected, setConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);

  /*
   * Hooks area
   */

  useEffect(() => {
    if (!gameCode) return;

    const socketURL = process.env.NEXT_PUBLIC_WS_URL;

    const handleKicked = (data: KickPlayerResponseDto) => {
      if (data.targetPlayerSessionId === currentPlayerSessionId) {
        alert(`You have been kicked from the game. Reason: ${data.reason}`);
        // Optionally, redirect the user or perform other actions
        window.location.href = "/"; // redirect to home or another page
      }
    };

    const stompClient = new Client({
      brokerURL: socketURL,
      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);

        // Subscribe to personal kick notifications
        stompClient.subscribe(`/queue/kick`, (message: IMessage) => {
          const data: KickPlayerResponseDto = JSON.parse(message.body);
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

  /*
   * functions
   */
  const onKickPlayer = (targetPlayerSessionId: string) => {
    if (clientRef.current?.connected && currentPlayerSessionId) {
      clientRef.current.publish({
        destination: `/app/game/${gameCode}/kick`,
        headers: {
          "x-player-session-id": currentPlayerSessionId, // player pressed the kick
        },
        body: JSON.stringify({ targetPlayerSessionId }),
      });
    }
  };

  const onDrawingSubmitted = useCallback(
    (roundNumber: number, turnNumber: number) => {
      if (clientRef.current?.connected && currentPlayerSessionId) {
        clientRef.current.publish({
          destination: `/app/game/${gameCode}/drawing-submitted`,
          headers: {
            "x-player-session-id": currentPlayerSessionId, // player pressed the kick
          },
          body: JSON.stringify({ roundNumber, turnNumber }),
        });
      }
    },
    [gameCode]
  );

  const onGuessSubmitted = useCallback(
    (roundNumber: number, turnNumber: number) => {
      if (clientRef.current?.connected && currentPlayerSessionId) {
        clientRef.current.publish({
          destination: `/app/game/${gameCode}/guess-submitted`,
          body: JSON.stringify({ roundNumber, turnNumber }),
        });
      }
    },
    [gameCode]
  );

  return {
    connected,
    onKickPlayer,
    onDrawingSubmitted,
    onGuessSubmitted,
  };
}
