import { getMockGameByCode } from "../mock/mockdata.unified";
import {
  CreateGameRequest,
  GameResponseDTO,
  GameSpectatorDTO,
  JoinGameRequest,
  SubmitDrawingRequest,
  SubmitDrawingResponse,
  SubmitGuessRequest,
} from "./game.type";
import { isUseMockApi, mockApiResponses } from "./mockApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Session-based Authentication
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("API_URL", API_URL, endpoint);

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

export const gameApi = {
  //CreateGameRequest
  createGame: async (data: CreateGameRequest): Promise<GameResponseDTO> => {
    // Use mock if enabled
    if (isUseMockApi()) {
      return new Promise((resolve) => {
        resolve(mockApiResponses.createGame(data));
      });
    }

    return await fetchApi<GameResponseDTO>("/api/games/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // JoinGameRequest
  joinGame: async (data: JoinGameRequest): Promise<GameResponseDTO> => {
    // Use mock if enabled
    if (isUseMockApi()) {
      return new Promise((resolve) => {
        resolve(mockApiResponses.joinGame(data));
      });
    }
    return await fetchApi("/api/games/join", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  startGame: async (gameCode: string): Promise<void> => {
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
  },

  //SubmitDrawingRequest
  submitDrawing: async (
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
  },

  //SubmitGuessRequest
  submitGuess: async (data: SubmitGuessRequest): Promise<void> => {
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
  },

  spectateGame: async (gameCode: string): Promise<GameSpectatorDTO> => {
    if (isUseMockApi()) {
      return new Promise((resolve) => {
        resolve(getMockGameByCode(gameCode).spectator);
      });
    }
    return await fetchApi(`/api/games/${gameCode}/spectate`, { method: "GET" });
  },

  getGame: async (gameCode: string): Promise<GameResponseDTO> => {
    return await fetchApi(`/api/games/${gameCode}`, { method: "GET" });
  },
};
