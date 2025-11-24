"use server";
import { cookies } from "next/headers";
import { getMockGameByCode, mockGamesLobby } from "../mock/mockdata.unified";
import {
  CreateGameRequest,
  GameItemList,
  GameResponseDTO,
  GameSpectatorDTO,
  JoinGameRequest,
  SubmitDrawingRequest,
  SubmitDrawingResponse,
  SubmitGuessRequest,
} from "../types/game.type";
import { isUseMockApi, mockApiResponses } from "./mockApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Session-based Authentication
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("Test-API_URL", API_URL, endpoint);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Gửi session cookie
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return await response.json();
}

//CreateGameRequest
export const createGame = async (
  data: CreateGameRequest
): Promise<GameResponseDTO> => {
  // Use mock if enabled
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      resolve(mockApiResponses.createGame(data));
    });
  }
  console.log("API createGame called with data:", data);

  const result = await fetchApi<GameResponseDTO>("/api/games/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // set cookies
  if (result) {
    const cookiesStore = await cookies();
    cookiesStore.set("sessionId", result.sessionId);
    cookiesStore.set("gameCode", result.gameCode);
    cookiesStore.set("nickname", data.hostNickname);
    cookiesStore.set("lastGame", result.gameCode);
    cookiesStore.set("lastNickname", data.hostNickname);
  }
  return result;
};

// JoinGameRequest
export const joinGame = async (
  data: JoinGameRequest
): Promise<GameResponseDTO> => {
  // Use mock if enabled
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      resolve(mockApiResponses.joinGame(data));
    });
  }
  const result = await fetchApi<GameResponseDTO>("/api/games/join", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // set cookies
  if (result) {
    const cookiesStore = await cookies();
    cookiesStore.set("sessionId", result.sessionId);
    cookiesStore.set("gameCode", result.gameCode);
    cookiesStore.set("nickname", data.nickname);
    cookiesStore.set("lastGame", result.gameCode);
    cookiesStore.set("lastNickname", data.nickname);
  }
  return result;
};

export const startGame = async (gameCode: string): Promise<void> => {
  // UseMock
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      console.log("Mock: Game started", gameCode);
      resolve();
    });
  }

  return await fetchApi(`/api/games/${gameCode}/start`, {
    method: "POST",
  });
};

//SubmitDrawingRequest
export const submitDrawing = async (
  data: SubmitDrawingRequest
): Promise<SubmitDrawingResponse> => {
  // UseMock
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      resolve(mockApiResponses.submitDrawing());
    });
  }

  return await fetchApi("/api/games/submit-drawing", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

//SubmitGuessRequest
export const submitGuess = async (data: SubmitGuessRequest): Promise<void> => {
  //usemock
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      console.log("Mock: Guess ok", data);
      resolve();
    });
  }
  return await fetchApi("/api/games/submit-guess", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get Game list
export const getGameList = async (): Promise<GameItemList[]> => {
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      resolve(mockGamesLobby);
    });
  }
  return await fetchApi("/api/games/list", { method: "GET" });
};

export const spectateGame = async (
  gameCode: string
): Promise<GameSpectatorDTO> => {
  if (isUseMockApi()) {
    return new Promise((resolve) => {
      resolve(getMockGameByCode(gameCode).spectator);
    });
  }
  return await fetchApi(`/api/games/${gameCode}/spectate`, { method: "GET" });
};

export const getGame = async (
  gameCode: string,
  playerSessionId?: string
): Promise<GameResponseDTO> => {
  return await fetchApi(`/api/games/${gameCode}`, {
    method: "POST",
    body: JSON.stringify({ playerSessionId: playerSessionId }),
  });
};
