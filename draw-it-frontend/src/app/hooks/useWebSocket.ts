// app/hooks/useWebSocket.ts
"use client";

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KickPlayerResponse,
  PlayerDTO,
  PlayerListUpdate,
} from "../types/game.type";

export function useWebSocket(
  gameCode: string | null,
  currentSessionId?: string
) {
  const [connected, setConnected] = useState(false);
  const [kickedPlayer, setKickedPlayer] = useState<KickPlayerResponse | null>(
    null
  );
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!gameCode) return;

    const socketURL = process.env.NEXT_PUBLIC_WS_URL;
    if (!socketURL) {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    // notify kicked player to all subscribers
    const handleKicked = (data: KickPlayerResponse) => {
      // setKickedPlayer(data);
      // if current player is kicked, alert and redirect
      if (data.targetSessionId === currentSessionId) {
        alert(`You have been kicked from the game. Reason: ${data.reason}`);
        // Optionally, redirect the user or perform other actions
        window.location.href = "/"; // redirect to home or another page
      }
    };

    // return new player list to all subscribers
    const handlePlayerUpdate = (data: PlayerListUpdate) => {
      setPlayers(data.players);
    };

    // config stomp client
    const stompClient = new Client({
      brokerURL: socketURL,
      debug: function (str) {
        console.log(str);
      },
    });

    stompClient.onConnect = () => {
      console.log("WebSocket connected");
      setConnected(true);

      // Subscribe to personal kick notifications
      stompClient.subscribe(`/queue/kick`, (message: IMessage) => {
        const data: KickPlayerResponse = JSON.parse(message.body); // dto with new player list
        console.log("log-/queue/kick", data, message.body, currentSessionId);
        handleKicked(data);
      });

      // Subscribe to player updates
      stompClient.subscribe(
        `/topic/game/${gameCode}/players`,
        (message: IMessage) => {
          const data: PlayerListUpdate = JSON.parse(message.body);
          console.log(
            "handlePlayerUpdate",
            data,
            message.body,
            currentSessionId
          );
          handlePlayerUpdate(data);
        }
      );
    };

    stompClient.onDisconnect = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.log("Broker reported error: " + frame.headers["message"]);
      console.log("Additional details: " + frame.body);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [gameCode]);

  // functions
  const kickPlayer = (targetSessionId: string) => {
    if (clientRef.current?.connected) {
      const mySessionId = currentSessionId || "";
      clientRef.current.publish({
        destination: `/app/game/${gameCode}/kick`,
        body: JSON.stringify({ targetSessionId }), // player to be kicked
        headers: {
          "x-player-session-id": mySessionId, // player pressed the kick
        },
      });
      console.log(`Player: ${mySessionId} kicks ${targetSessionId}`);
    }
  };
  return {
    connected,

    kickPlayer,

    players,
  };
}
