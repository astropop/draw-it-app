// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { useWebSocket } from "@/app/hooks/useWebSocket";

import { GameResponseDTO, GameStatus } from "@/app/types/game.type";
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import GameArea from "./GameArea";
import Instructions from "./RightPanel/Instructions";
import RoomHeader from "./RoomHeader";

interface GameRoomProps {
  gameData: GameResponseDTO;
  currentSessionId?: string;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({
  gameData,
  currentSessionId,
}: GameRoomProps) {
  // Ensure defaults are set
  const initialGameState: GameResponseDTO = {
    ...gameData,
  };

  // Minimal state: keep local copy of game data for header display
  const currentSessionIdRef = useRef<string>("");
  const currentNicknameRef = useRef<string>("");

  const [localGameState, setLocalGameState] =
    useState<GameResponseDTO>(initialGameState);

  const websocketHook = useWebSocket;
  const { connected, players, kickPlayer } = websocketHook(
    gameData.gameCode,
    currentSessionId
  );

  // Initialize session id/nickname once on mount
  useEffect(() => {
    const sid = localStorage.getItem("sessionId") || currentSessionId || "";
    const nick = localStorage.getItem("nickname") || "";
    currentSessionIdRef.current = sid;
    currentNicknameRef.current = nick;
    setLocalGameState(initialGameState);
  }, [gameData, currentSessionId]);

  const handleKick = (targetSessionId: string) => {
    if (!targetSessionId) return;
    if (!window.confirm("Are you sure you want to kick this player?")) return;
    kickPlayer(targetSessionId);
  };

  // get players from websocket if available, otherwise from localGameState
  const currentPlayers =
    players && players.length > 0 ? players : localGameState.players || [];

  const isHost = useMemo(() => {
    // if isHost is provided in gameData, use it
    if (gameData.isHost !== undefined) return gameData.isHost;

    // current session id is not existing, not host
    const sid = currentSessionIdRef.current;
    if (!sid) return false;

    // get ishost from players list, if matching current sesisonId, current player is host
    const me = currentPlayers.find((p) => p.sessionId === sid);
    return me?.isHost ?? false;
  }, [gameData.isHost, currentPlayers]);

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <RoomHeader
        props={{
          gameData,
          localGameState,
          currentNickname: currentNicknameRef.current,
          isHost,
          connected,
        }}
      />

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Panel - Players */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 1 }}>
                Players
              </Typography>
              <List dense>
                {currentPlayers.map((p) => (
                  <ListItem
                    key={p.sessionId}
                    divider
                    secondaryAction={
                      isHost && p.sessionId !== currentSessionIdRef.current ? (
                        <Button
                          size='small'
                          color='error'
                          onClick={() => handleKick(p.sessionId)}
                        >
                          Kick
                        </Button>
                      ) : null
                    }
                  >
                    <ListItemText
                      primary={p.nickname || p.sessionId}
                      secondary={p.isHost ? "Host" : "Player"}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Middle Panel - Game Area (no websocket usage here) */}
        <Grid size={{ xs: 12, md: 6 }}>
          {localGameState.status === GameStatus.WAITING && (
            <GameArea
              props={{
                waitingprops: {
                  localGameState,
                  isHost,
                  currentPlayers,
                },
              }}
            />
          )}

          {/* {localGameState.status === GameStatus.IN_PROGRESS && (
            <GameArea
              props={{
                inprogprops: {
                  localGameState,
                },
              }}
            />
          )} */}
        </Grid>

        {/* Right Panel - Instructions */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Instructions />
        </Grid>
      </Grid>
    </Container>
  );
}
