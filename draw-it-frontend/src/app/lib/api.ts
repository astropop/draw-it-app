"use server";

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

// export const gameApi = {
//   //CreateGameRequest

//   startGame: async (gameCode: string): Promise<void> => {
//     // UseMock
//     if (isUseMockApi()) {
//       return new Promise((resolve) => {
//         console.log("Mock: Game started", gameCode);
//         resolve();
//       });
//     }

//     return await fetchApi(`/api/games/${gameCode}/start`, {
//       method: "POST",
//     });
//   },

//   //SubmitDrawingRequest
//   submitDrawing: async (
//     data: SubmitDrawingRequest
//   ): Promise<SubmitDrawingResponse> => {
//     // UseMock
//     if (isUseMockApi()) {
//       return new Promise((resolve) => {
//         resolve(mockApiResponses.submitDrawing());
//       });
//     }

//     return await fetchApi("/api/games/submit-drawing", {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   },

//   //SubmitGuessRequest
//   submitGuess: async (data: SubmitGuessRequest): Promise<void> => {
//     //usemock
//     if (isUseMockApi()) {
//       return new Promise((resolve) => {
//         console.log("Mock: Guess ok", data);
//         resolve();
//       });
//     }
//     return await fetchApi("/api/games/submit-guess", {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   },

// };
