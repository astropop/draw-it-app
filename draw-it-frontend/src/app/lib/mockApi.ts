// app/lib/mockApi.ts

import { getMockGameByCode } from "../mock/mockdata.unified";
import {
  CreateGameRequest,
  GameResponseDTO,
  GameStatus,
  JoinGameRequest,
  SubmitDrawingResponse,
} from "../types/game.type";

export const mockApiResponses = {
  createGame: (request: CreateGameRequest): GameResponseDTO => ({
    gameId: Math.floor(Math.random() * 10000),
    gameCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    sessionId:
      "550e8400-e29b-41d4-a716-" + Math.random().toString(36).substring(2, 14),
    status: GameStatus.WAITING,
    theme: request.theme,
    maxRounds: request.maxRounds,
    currentRound: 0,
    drawingTime: request.drawingTime,
    guessingTime: request.guessingTime,
    words: ["mock1", "mock2", "mock3", "mock4", "mock5"],
    isHost: true,
    players: [
      {
        nickname: request.hostNickname,
        score: 0,
        isHost: true,
        sessionId:
          "550e8400-e29b-41d4-a716-" +
          Math.random().toString(36).substring(2, 14),
      },
    ],
  }),

  // ✅ NEW: Join game mock
  joinGame: (request: JoinGameRequest): GameResponseDTO => {
    const mockGame = getMockGameByCode(request.gameCode);

    if (!mockGame) {
      throw new Error("Game not found");
    }
    // Get spectator data to check status
    const { spectator } = mockGame as any;

    // Check if game already started
    if (spectator.status === GameStatus.IN_PROGRESS) {
      throw new Error("Game already started. Cannot join.");
    }

    // Check if game finished
    if (spectator.status === GameStatus.FINISHED) {
      throw new Error("Game has finished. Please create a new game.");
    }

    // Get base game data
    const baseData =
      "roomAsHost" in mockGame
        ? mockGame.roomAsHost
        : "roomAsDrawer" in mockGame
        ? mockGame.roomAsDrawer
        : mockGame.room;

    if (!baseData) {
      throw new Error("Game not found");
    }

    // Create new session for joining player
    const newSessionId =
      "550e8400-e29b-41d4-a716-" + Math.random().toString(36).substring(2, 14);

    // Add player to game
    const updatedPlayers = [
      ...baseData.players,
      {
        nickname: request.nickname,
        score: 0,
        isHost: false,
        sessionId: newSessionId,
      },
    ];

    return {
      ...baseData,
      sessionId: newSessionId,
      isHost: false,
      players: updatedPlayers,
    };
  },

  submitDrawing: (): SubmitDrawingResponse => ({
    containsText: Math.random() > 0.7,
    containsKeyword: Math.random() > 0.9,
    warning: Math.random() > 0.9 ? "WARNING: Contains keyword!" : undefined,
  }),
};

// Check if should use mock
export const useMockApi = () => {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
};
